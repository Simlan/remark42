import { h, Fragment, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { useIntl, FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { useDispatch } from 'react-redux';

import type { OAuthProvider } from 'common/types';
import { setUser } from 'store/user/actions';
import { Input } from 'components/input';
import TextareaAutosize from 'components/textarea-autosize';

import Button from './components/button';
import OAuthButton from './components/oauth-button';
import messages from './auth.messsages';
import { useDropdown } from './auth.hooks';
import { getProviders, getTokenInvalidReason } from './auth.utils';
import { oauthSigninActor, emailSignin, verifyEmailSignin, anonymousSignin } from './auth.api';

import styles from './auth.module.css';

type OAuthProvidersProps = {
  providers: OAuthProvider[];
};

function getButtonVariant(num: number) {
  if (num === 2) {
    return 'name';
  }

  if (num === 1) {
    return 'full';
  }

  return 'icon';
}

const oauthSignin = oauthSigninActor();

const OAuthProviders: FunctionComponent<OAuthProvidersProps> = ({ providers }) => {
  const buttonVariant = getButtonVariant(providers.length);
  const handleOathClick = (evt: MouseEvent) => {
    const { href } = evt.currentTarget as HTMLAnchorElement;

    evt.preventDefault();
    oauthSignin(href);
  };

  return (
    <>
      <h5 className={styles.title}>Use Social Network</h5>
      <ul className={classnames(styles.oauth)}>
        {providers.map((p) => (
          <li className={classnames(styles.oauthItem)}>
            <OAuthButton provider={p} onClick={handleOathClick} variant={buttonVariant} />
          </li>
        ))}
      </ul>
    </>
  );
};

const Auth: FunctionComponent = () => {
  const intl = useIntl();
  const dispath = useDispatch();

  const [oauthProviders, formProviders] = getProviders();
  // State of UI
  const [isLoading, setLoading] = useState(false);
  const [view, setView] = useState<typeof formProviders[number] | 'token'>(formProviders[0]);
  const [ref, isDropdownShowed, toggleDropdownState] = useDropdown(view === 'token');

  // Errors
  const [invalidReason, setInvalidReason] = useState<keyof typeof messages | null>(null);

  const handleProviderChange = (evt: Event) => {
    const { value } = evt.currentTarget as HTMLInputElement;

    setInvalidReason(null);
    setView(value as typeof formProviders[number]);
  };

  const handleSubmit = async (evt: Event) => {
    const data = new FormData(evt.target as HTMLFormElement);
    evt.preventDefault();
    setLoading(true);
    setInvalidReason(null);

    try {
      switch (view) {
        case 'anonymous': {
          const username = data.get('username') as string;
          const user = await anonymousSignin(username);

          dispath(setUser(user));
          break;
        }
        case 'email': {
          const email = data.get('email') as string;
          const username = data.get('username') as string;

          await emailSignin(email, username);
          setView('token');
          break;
        }
        case 'token': {
          const token = data.get('token') as string;
          const invalidReason = getTokenInvalidReason(token);

          if (invalidReason) {
            setInvalidReason(invalidReason);
          } else {
            const user = await verifyEmailSignin(token);

            dispath(setUser(user));
          }

          break;
        }
      }
    } catch (e) {
      setInvalidReason(e.message || e.error);
    }

    setLoading(false);
  };

  const handleShowEmailStep = () => {
    setView('email');
  };

  const handleDropdownClose = () => {
    setView(formProviders[0]);
    toggleDropdownState();
  };

  const hasOAuthProviders = oauthProviders.length > 0;
  const hasFormProviders = formProviders.length > 0;
  const errorMessage =
    invalidReason !== null && invalidReason in messages ? intl.formatMessage(messages[invalidReason]) : invalidReason;
  const isTokenStep = view === 'token';

  return (
    <div className={classnames('auth-panel', styles.root)} ref={ref}>
      <Button
        onClick={toggleDropdownState}
        disabled={isDropdownShowed}
        suffix={
          <svg width="14" height="14" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 11.5L14.5 19L22 11"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
      >
        <FormattedMessage id="auth.signin" defaultMessage="Sign In" />
      </Button>
      {isDropdownShowed && (
        <div className={styles.dropdown}>
          <form className={classnames('signin-form', styles.form)} onSubmit={handleSubmit}>
            {isTokenStep ? (
              <>
                <div className={styles.row}>
                  <div className={styles.backButton}>
                    <Button size="small" kind="transparent" onClick={handleShowEmailStep}>
                      <svg
                        className={styles.backButtonArrow}
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.75 3L5 7.25L9 11"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Back
                    </Button>
                  </div>
                  <button className={styles.closeButton} title="Close sign-in dropdown" onClick={handleDropdownClose}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2 2L12 12M12 2L2 12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className={classnames(styles.row)}>
                  <TextareaAutosize
                    name="token"
                    className={classnames(styles.textarea)}
                    placeholder={intl.formatMessage(messages.token)}
                    disabled={isLoading}
                  />
                </div>
              </>
            ) : (
              <>
                {hasOAuthProviders && <OAuthProviders providers={oauthProviders} />}
                {hasOAuthProviders && hasFormProviders && <div className={styles.divider} title="or" />}
                {formProviders.length === 1 ? (
                  <h5 className={styles.title}>{formProviders[0]}</h5>
                ) : (
                  <div className={styles.tabs}>
                    {formProviders.map((p) => (
                      <label key={p} className={styles.provider}>
                        <input
                          className={styles.radio}
                          type="radio"
                          name="form-provider"
                          value={p}
                          onChange={handleProviderChange}
                          checked={p === view}
                        />
                        <span className={styles.providerName}>{p.slice(0, 6)}</span>
                      </label>
                    ))}
                  </div>
                )}
                <div className={classnames('auth-row', styles.row)}>
                  <Input
                    className="auth-input-username"
                    required
                    name="username"
                    minLength={3}
                    pattern="^[\p{L}\d_]+$"
                    title={intl.formatMessage(messages.symbolsRestriction)}
                    placeholder={intl.formatMessage(messages.username)}
                    disabled={isLoading}
                  />
                </div>
                {view === 'email' && (
                  <div className={classnames('auth-row', styles.row)}>
                    <Input
                      className="auth-input-email"
                      required
                      name="email"
                      type="email"
                      placeholder={intl.formatMessage(messages.emailAddress)}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </>
            )}
            <input className={styles.honeypot} type="checkbox" tabIndex={-1} autoComplete="off" />
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <i className={styles.spinner} role="presentation" aria-label="Loading..." /> : 'Submit'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Auth;
