import type { User } from 'common/types';

import { authFetcher } from 'common/fetcher';

const EMAIL_SIGNIN_ENDPOINT = '/email/login';

export function anonymousSignin(user: string): Promise<User> {
  return authFetcher.get<User>('/anonymous/login', { user });
}

export function emailSignin(email: string, username: string): Promise<unknown> {
  return authFetcher.get(EMAIL_SIGNIN_ENDPOINT, { address: email, user: username });
}

/**
 * First step of two of `email` authorization
 *
 * @param username userrname
 * @param address email address
 */
export function verifyEmailSignin(token: string): Promise<User> {
  return authFetcher.get(EMAIL_SIGNIN_ENDPOINT, { token });
}

export function oauthSigninActor() {
  // const REVALIDATION_TIMEOUT = 60 * 1000; // 1min
  // let lastAttemptTime = 0;
  // let authWindow: Window | null = null;

  function handleWindowVisibilityChange() {
    if (!document.hasFocus() || document.hidden) {
      return;
    }
    console.log('in focus');
  }

  document.addEventListener('visibilitychange', handleWindowVisibilityChange);
  window.addEventListener('focus', handleWindowVisibilityChange);

  return function oauthSignin(url: string) {
    // authWindow = window.open(url);
    // lastAttemptTime = Date.now();
  };
}

export function logout(): Promise<void> {
  return authFetcher.get('/logout');
}
