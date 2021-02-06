jest.mock('./settings', () => ({
  siteId: 'remark',
}));

import { oauthSignin } from './auth.api';

describe('api', () => {
  it('should open oauth endpoint with right url', () => {
    window.open = jest.fn().mockImplementationOnce(jest.fn());
    oauthSignin('google');

    expect(window.open).toHaveBeenCalledWith(
      '/auth/google/login?from=http%3A%2F%2Flocalhost%2F%3FselfClose&site=remark'
    );
  });
});
