import type { HttpClient } from "../http/http-client.js";
import type { UserPwd } from "../types/sign-in.js";

/**
 * `Sign In` resource (confirmed against Nayax devzone docs).
 *
 * Neither endpoint has a documented 200 response body — both are exposed as
 * returning `unknown` so the caller can interpret whatever the server sends.
 */
export class SignInResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * `GET /signin` — note the path is NOT under `/v1/`; it sits directly at
   * the operational surface (`<baseUrl>/operational/signin`).
   */
  signin(): Promise<unknown> {
    return this.http.request<unknown>({
      method: "GET",
      path: "/signin",
    });
  }

  /** `POST /v1/signin` — username/password sign-in. */
  userSignIn(body: UserPwd): Promise<unknown> {
    return this.http.request<unknown>({
      method: "POST",
      path: "/v1/signin",
      body,
    });
  }
}
