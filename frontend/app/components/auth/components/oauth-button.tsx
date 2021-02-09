import { h, FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { defineMessages, useIntl } from 'react-intl';
import classnames from 'classnames';

import type { OAuthProvider } from 'common/types';
import { siteId } from 'common/settings';
import capitalizeFirstLetter from 'utils/capitalize-first-letter';

import styles from './oauth-button.module.css';

const OAUTH_ICONS: Record<string, string> = {
  facebook: require('./assets/facebook.svg').default as string,
  twitter: require('./assets/twitter.svg').default as string,
  google: require('./assets/google.svg').default as string,
  github: require('./assets/github.svg').default as string,
  microsoft: require('./assets/microsoft.svg').default as string,
  yandex: require('./assets/yandex.svg').default as string,
};

const location = encodeURIComponent(`${window.location.origin}${window.location.pathname}?selfClose`);

if (process.env.NODE_ENV === 'development') {
  Object.assign(OAUTH_ICONS, { dev: require('./assets/dev.svg').default as string });
}

export type OAuthIconProps = {
  variant: 'full' | 'name' | 'icon';
  onClick(evt: MouseEvent): void;
  provider: OAuthProvider;
};

const OAuthButton: FunctionComponent<OAuthIconProps> = ({ provider, onClick, variant }) => {
  const intl = useIntl();

  const [icon, setIcon] = useState<string>('');
  const providerName = capitalizeFirstLetter(provider);
  const title = intl.formatMessage(messages.buttonTitle);

  useEffect(() => {
    let mounted = true;
    const url = OAUTH_ICONS[provider];

    if (!url) {
      return;
    }

    fetch(url)
      .then((res) => res.text())
      .then((icon) => {
        if (!mounted) {
          return;
        }
        setIcon(icon);
      });

    return () => {
      mounted = false;
    };
  }, [provider]);

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`/auth/${provider}/login?from=${location}&site=${siteId}`}
      onClick={onClick}
      className={classnames('oauth-button', styles.root, styles[variant], styles[provider])}
      title={`${title} ${providerName}`}
      data-provider-name={providerName}
    >
      <i
        className="oauth-button-icon"
        role="presentation"
        dangerouslySetInnerHTML={{ __html: icon }} // eslint-disable-line react/no-danger
      />
    </a>
  );
};

const messages = defineMessages({
  buttonTitle: {
    id: 'signin.oauth-button',
    defaultMessage: 'Sign In with',
  },
});

export default OAuthButton;
