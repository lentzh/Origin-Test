#!/usr/bin/env bash
# Projekt origin-checker in GitLab (Gruppe zapv) anlegen und pushen.
# Voraussetzung: GITLAB_TOKEN mit api + write_repository
#
# Nutzung:
#   export GITLAB_TOKEN="glpat-…"
#   ./tools/gitlab-setup.sh

set -euo pipefail

GITLAB_HOST="${GITLAB_HOST:-https://gitlab.ard.de}"
GROUP_PATH="${GROUP_PATH:-zapv}"
PROJECT_NAME="${PROJECT_NAME:-origin-checker}"
BRANCH="${BRANCH:-standalone}"

if [[ -z "${GITLAB_TOKEN:-}" ]]; then
  echo "Fehler: GITLAB_TOKEN ist nicht gesetzt." >&2
  echo "Erstelle einen PAT unter ${GITLAB_HOST}/-/user_settings/personal_access_tokens" >&2
  echo "Scopes: api, write_repository" >&2
  exit 1
fi

api() {
  curl -sfS --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" "$@"
}

echo "→ Gruppe ${GROUP_PATH} auflösen …"
NS_ID="$(api "${GITLAB_HOST}/api/v4/groups/${GROUP_PATH}" | python3 -c 'import sys,json; print(json.load(sys.stdin)["id"])')"

echo "→ Projekt ${PROJECT_NAME} prüfen/anlegen …"
EXISTING="$(api "${GITLAB_HOST}/api/v4/projects/${GROUP_PATH}%2F${PROJECT_NAME}" 2>/dev/null || true)"
if [[ -z "${EXISTING}" ]]; then
  api -X POST "${GITLAB_HOST}/api/v4/projects" \
    --header "Content-Type: application/json" \
    --data "{\"name\":\"${PROJECT_NAME}\",\"path\":\"${PROJECT_NAME}\",\"namespace_id\":${NS_ID},\"visibility\":\"private\"}" \
    >/dev/null
  echo "   Projekt angelegt."
else
  echo "   Projekt existiert bereits."
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${REPO_ROOT}"

REMOTE_URL="https://oauth2:${GITLAB_TOKEN}@${GITLAB_HOST#https://}/${GROUP_PATH}/${PROJECT_NAME}.git"
git remote remove gitlab 2>/dev/null || true
git remote add gitlab "${REMOTE_URL}"

echo "→ Push Branch ${BRANCH} als main …"
git push -u gitlab "${BRANCH}:main"

echo "→ Push Branch ${BRANCH} …"
git push -u gitlab "${BRANCH}"

echo "Fertig: ${GITLAB_HOST}/${GROUP_PATH}/${PROJECT_NAME}"
