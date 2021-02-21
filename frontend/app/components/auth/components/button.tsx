import { h, FunctionComponent, JSX, VNode } from 'preact';
import classnames from 'classnames/bind';

import styles from './button.module.css';

const cx = classnames.bind(styles);

export type ButtonProps = Omit<JSX.HTMLAttributes<HTMLButtonElement>, 'size'> & {
  size?: 'small';
  kind?: 'transparent';
  suffix?: VNode;
  loading?: boolean;
};

const Button: FunctionComponent<ButtonProps> = ({ children, size, kind, suffix, ...props }) => {
  return (
    <button className={cx(styles.button, kind, size)} {...props}>
      {children}
      {suffix && <div className={styles.suffix}>{suffix}</div>}
    </button>
  );
};

export default Button;
