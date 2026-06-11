#!/usr/bin/env bash
# Projekt origin-checker in GitLab (Namespace zapv) anlegen und pushen.
#
# Voraussetzung: GITLAB_TOKEN (Personal Access Token)
# Empfohlene Scopes: api, read_api, write_repository
#
# Nutzung:
#   export GITLAB_TOKEN="glpat-…"
#   ./tools/gitlab-setup.sh
#
# Optional:
#   NAMESPACE_ID=12345 ./tools/gitlab-setup.sh   # Namespace-ID aus GitLab-UI
#   PUSH_ONLY=1 ./tools/gitlab-setup.sh          # nur pushen, kein Anlegen
#   GROUP_PATH=andere-gruppe ./tools/gitlab-setup.sh

set -euo pipefail

GITLAB_HOST="${GITLAB_HOST:-https://gitlab.ard.de}"
GROUP_PATH="${GROUP_PATH:-zapv}"
PROJECT_NAME="${PROJECT_NAME:-origin-checker}"
BRANCH="${BRANCH:-standalone}"
PUSH_ONLY="${PUSH_ONLY:-0}"

if [[ -z "${GITLAB_TOKEN:-}" ]]; then
  echo "Fehler: GITLAB_TOKEN ist nicht gesetzt." >&2
  echo "PAT erstellen: ${GITLAB_HOST}/-/user_settings/personal_access_tokens" >&2
  echo "Scopes: api, read_api, write_repository" >&2
  exit 1
fi

TMP_BODY="$(mktemp)"
trap 'rm -f "${TMP_BODY}"' EXIT

api() {
  local method="${1:-GET}"
  shift
  local url="$1"
  shift
  local code
  code="$(curl -sS -o "${TMP_BODY}" -w "%{http_code}" -X "${method}" \
    --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" "$@" "${url}")"
  echo "${code}"
}

api_get() { api GET "$@"; }
api_post() { api POST "$@" --header "Content-Type: application/json"; }

fail_api() {
  local step="$1"
  local code="$2"
  echo "" >&2
  echo "Fehler bei: ${step} (HTTP ${code})" >&2
  if [[ -s "${TMP_BODY}" ]]; then
    echo "Antwort:" >&2
    cat "${TMP_BODY}" >&2
    echo "" >&2
  fi
}

echo "→ Token prüfen …"
CODE="$(api_get "${GITLAB_HOST}/api/v4/user")"
if [[ "${CODE}" != "200" ]]; then
  fail_api "Token-Validierung (/api/v4/user)" "${CODE}"
  echo "Hinweis: Token ungültig, abgelaufen oder Scope 'read_api'/'api' fehlt." >&2
  exit 1
fi
USER_NAME="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["username"])' "${TMP_BODY}")"
echo "   Angemeldet als: ${USER_NAME}"

resolve_namespace_id() {
  if [[ -n "${NAMESPACE_ID:-}" ]]; then
    echo "${NAMESPACE_ID}"
    return 0
  fi

  echo "→ Namespace '${GROUP_PATH}' auflösen …" >&2

  # 1) Direkt als Gruppe
  CODE="$(api_get "${GITLAB_HOST}/api/v4/groups/${GROUP_PATH}")"
  if [[ "${CODE}" == "200" ]]; then
    python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["id"])' "${TMP_BODY}"
    return 0
  fi

  # 2) Suche in sichtbaren Gruppen
  CODE="$(api_get "${GITLAB_HOST}/api/v4/groups?search=${GROUP_PATH}&per_page=100")"
  if [[ "${CODE}" == "200" ]]; then
    local found
    found="$(python3 - "${GROUP_PATH}" "${TMP_BODY}" <<'PY'
import json, sys
target, path = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as f:
    groups = json.load(f)
for g in groups:
    if g.get("full_path") == target or g.get("path") == target:
        print(g["id"])
        break
PY
)"
    if [[ -n "${found}" ]]; then
      echo "${found}"
      return 0
    fi
  fi

  # 3) User-Namespace (falls zapv ein Benutzername ist)
  CODE="$(api_get "${GITLAB_HOST}/api/v4/users?username=${GROUP_PATH}")"
  if [[ "${CODE}" == "200" ]]; then
    local uid
    uid="$(python3 - "${GROUP_PATH}" "${TMP_BODY}" <<'PY'
import json, sys
target, path = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as f:
    users = json.load(f)
for u in users:
    if u.get("username") == target:
        print(u["id"])
        break
PY
)"
    if [[ -n "${uid}" ]]; then
      echo "${uid}"
      return 0
    fi
  fi

  # 4) Namespace-Suche (GitLab 14+)
  CODE="$(api_get "${GITLAB_HOST}/api/v4/namespaces?search=${GROUP_PATH}&per_page=100")"
  if [[ "${CODE}" == "200" ]]; then
    local nid
    nid="$(python3 - "${GROUP_PATH}" "${TMP_BODY}" <<'PY'
import json, sys
target, path = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as f:
    items = json.load(f)
for n in items:
    if n.get("full_path") == target or n.get("path") == target:
        print(n["id"])
        break
PY
)"
    if [[ -n "${nid}" ]]; then
      echo "${nid}"
      return 0
    fi
  fi

  return 1
}

project_exists() {
  CODE="$(api_get "${GITLAB_HOST}/api/v4/projects/${GROUP_PATH}%2F${PROJECT_NAME}")"
  [[ "${CODE}" == "200" ]]
}

create_project() {
  local ns_id="$1"
  echo "→ Projekt ${GROUP_PATH}/${PROJECT_NAME} anlegen (namespace_id=${ns_id}) …"
  CODE="$(api_post "${GITLAB_HOST}/api/v4/projects" \
    --data "{\"name\":\"${PROJECT_NAME}\",\"path\":\"${PROJECT_NAME}\",\"namespace_id\":${ns_id},\"visibility\":\"private\"}")"
  if [[ "${CODE}" == "201" ]]; then
    echo "   Projekt angelegt."
    return 0
  fi
  fail_api "Projekt anlegen" "${CODE}"
  return 1
}

if [[ "${PUSH_ONLY}" != "1" ]]; then
  if project_exists; then
    echo "→ Projekt existiert bereits."
  else
    if ! NS_ID="$(resolve_namespace_id)"; then
      echo "" >&2
      echo "Namespace '${GROUP_PATH}' konnte nicht aufgelöst werden (häufig HTTP 403 = kein Zugriff auf die Gruppe)." >&2
      echo "" >&2
      echo "Optionen:" >&2
      echo "  A) Projekt manuell in GitLab anlegen: ${GITLAB_HOST}/${GROUP_PATH} → New project → ${PROJECT_NAME}" >&2
      echo "     Danach nur pushen: PUSH_ONLY=1 ./tools/gitlab-setup.sh" >&2
      echo "  B) Namespace-ID aus Gruppen-Einstellungen ermitteln und setzen:" >&2
      echo "     NAMESPACE_ID=<id> ./tools/gitlab-setup.sh" >&2
      echo "  C) Gruppen-Maintainer um Developer+-Rolle in '${GROUP_PATH}' bitten." >&2
      echo "  D) PAT mit Scopes api + read_api + write_repository prüfen (kein abgelaufenes Token)." >&2
      exit 1
    fi
    echo "   namespace_id=${NS_ID}"
    create_project "${NS_ID}" || exit 1
  fi
else
  echo "→ PUSH_ONLY: Projekt-Anlage übersprungen."
  if ! project_exists; then
    fail_api "Projekt vorhanden? (${GROUP_PATH}/${PROJECT_NAME})" "$(api_get "${GITLAB_HOST}/api/v4/projects/${GROUP_PATH}%2F${PROJECT_NAME}")"
    echo "Projekt nicht gefunden. Bitte zuerst in GitLab anlegen oder PUSH_ONLY weglassen." >&2
    exit 1
  fi
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${REPO_ROOT}"

REMOTE_URL="https://oauth2:${GITLAB_TOKEN}@${GITLAB_HOST#https://}/${GROUP_PATH}/${PROJECT_NAME}.git"
git remote remove gitlab 2>/dev/null || true
git remote add gitlab "${REMOTE_URL}"

echo "→ Push Branch ${BRANCH} als main …"
git push -u gitlab "${BRANCH}:main"

echo "→ Push Branch ${BRANCH} …"
git push -u gitlab "${BRANCH}" || true

echo ""
echo "Fertig: ${GITLAB_HOST}/${GROUP_PATH}/${PROJECT_NAME}"
