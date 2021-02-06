import type { User } from 'common/types';

import { authFetcher } from 'common/fetcher';
import { getUser } from 'common/api';
import { siteId } from 'common/settings';

const FROM_URL = `${window.location.origin}${window.location.pathname}?selfClose`;
const EMAIL_SIGNIN_ENDPOINT = '/email/login';

export function anonymousSignin(user: string): Promise<User> {
  return authFetcher.get<User>('/anonymous/login', {
    user,
    aud: siteId,
    from: FROM_URL,
  });
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

const REVALIDATION_TIMEOUT = 60 * 1000; // 1min
let lastAttemptTime = Date.now();

export function userUpdater() {
  let currentRequest: Promise<User | null> | null = null;

  async function handleVisibilityChange() {
    if (!window.navigator.onLine) {
      console.log('offline');
      return;
    }
    if (document.hidden) {
      console.log('hidden');
      return;
    }
    if (currentRequest) {
      console.log('request in progress');
    }
    if (Date.now() - lastAttemptTime < REVALIDATION_TIMEOUT) {
      console.log(Date.now() - lastAttemptTime - REVALIDATION_TIMEOUT);
      return;
    }

    const resetOnEnd = () => {
      currentRequest = null;
    };

    console.log('Try to revalidate user');
    currentRequest = getUser();
    currentRequest.then(resetOnEnd).catch(resetOnEnd);
    lastAttemptTime = Date.now();
  }

  handleVisibilityChange();

  window.addEventListener('visibilitychange', handleVisibilityChange);
}

export function oauthSignin(url: string) {
  lastAttemptTime = 0;
  window.open(url);
  lastAttemptTime = Date.now() - REVALIDATION_TIMEOUT;
}

export function logout(): Promise<void> {
  return authFetcher.get('/logout');
}
