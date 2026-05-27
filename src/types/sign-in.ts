/**
 * `Sign In` schemas.
 * Source: https://devzone.nayax.com/reference/lynx/sign-in
 *
 * The upstream OpenAPI does not document the 200 response shapes for either
 * `GET /signin` or `POST /v1/signin` — server presumably returns a session
 * cookie or status only. The library exposes them returning `unknown` so
 * consumers can interpret whatever comes back.
 */

export interface UserPwd {
  usr?: string | null;
  pwd?: string | null;
}
