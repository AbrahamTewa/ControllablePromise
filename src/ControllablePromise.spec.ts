import ControllablePromise from './ControllablePromise';

describe('ControllablePromise', () => {
  const promiseValue = { promise: true };
  const promiseError = new Error('ControllablePromise error');

  it('extends a Promise', () => {
    const promise = new ControllablePromise();
    expect(promise).toBeInstanceOf(Promise);
  });

  describe('.callbackResolve', () => {
    it('reject the promise if an error reason is provided', async () => {
      const promise = new ControllablePromise<object>();

      promise.callbackResolver(promiseError);

      await expect(() => promise)
        .rejects
        .toThrow(promiseError);
    });

    it('resolve the promise if a value is provided', async () => {
      const promise = new ControllablePromise<object>();

      promise.callbackResolver(undefined, promiseValue);

      const value = await promise;

      expect(value).toBe(promiseValue);
    });
  });

  describe('.createdAt', () => {
    it('match the creation date', () => {
      const beforeDate = new Date();
      const promise = new ControllablePromise();
      const afterDate = new Date();
      expect(promise.createdAt).toBeInstanceOf(Date);
      expect(promise.createdAt.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
      expect(promise.createdAt.getTime()).toBeLessThanOrEqual(afterDate.getTime());
    });
  });

  describe('.resolve()', () => {
    it('resolve the promise', async () => {
      const promise = new ControllablePromise<object>();
      const expectedValue = {};

      promise.resolve(expectedValue);

      const value = await promise;

      expect(value).toBe(expectedValue);
    });

    it('does\'t resolve as second time the promise', async () => {
      const promise = new ControllablePromise<object>();
      const expectedValue = {};
      const notExpectedValue = {};

      promise.resolve(expectedValue);
      const valueResolveA = await promise;

      promise.resolve(notExpectedValue);
      const valueResolveB = await promise;

      expect(valueResolveA).toBe(expectedValue);
      expect(valueResolveB).toBe(expectedValue);
      expect(valueResolveB).not.toBe(notExpectedValue);
    });

    it('don\'t bypass a rejected value', async () => {
      const promise = new ControllablePromise<object>();
      const expectedError = new Error();
      const notExpectedValue = {};

      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      promise.reject(expectedError);

      await expect(() => promise)
        .rejects
        .toThrow(expectedError);

      promise.resolve(notExpectedValue);

      await expect(() => promise)
        .rejects
        .toThrow(expectedError);
    });

    it('is not bypassed by a rejected value', async () => {
      const promise = new ControllablePromise<object>();
      const expectedValue = {};
      const notExpectedError = new Error();

      promise.resolve(expectedValue);

      expect(await promise).toBe(expectedValue);

      promise.reject(notExpectedError);

      expect(await promise).toBe(expectedValue);
    });
  });

  describe('.reject()', () => {
    it('reject the promise', async () => {
      const promise = new ControllablePromise<object>();

      promise.reject(promiseError);

      await expect(() => promise)
        .rejects
        .toThrow(promiseError);
    });

    it('does\'t reject as second time the promise', async () => {
      const promise = new ControllablePromise<object>();
      const notExpectedError = new Error();

      promise.reject(promiseError);
      await expect(() => promise)
        .rejects
        .toThrow(promiseError);

      promise.reject(notExpectedError);
      await expect(() => promise)
        .rejects
        .toThrow(promiseError);
    });
  });

  describe('.onTimeout()', () => {
    const timeoutValue = { promise: false, timeout: true };
    const timeoutError = new Error('Timeout error');
    const timeout = 100;

    describe('timeout callback return value', () => {
      describe('promise resolved...', () => {
        it('in time: resolve promise value', async () => {
          const promise = new ControllablePromise<object>();

          let timeoutCbCalled = false;

          const onTimeout = () => {
            timeoutCbCalled = true;
            return timeoutValue;
          };

          setTimeout(
            () => {
              promise.resolve(promiseValue);
            },
            timeout / 2,
          );

          const value = await promise.onTimeout(
            onTimeout,
            timeout,
          );

          expect(value).toBe(promiseValue);
          expect(timeoutCbCalled).toBe(false);
        });

        it('timed out: resolve timeout callback value', async () => {
          const promise = new ControllablePromise<object>();

          let timeoutCbCalled = false;

          const onTimeout = () => {
            timeoutCbCalled = true;
            return timeoutValue;
          };

          setTimeout(
            () => {
              promise.resolve(promiseValue);
            },
            timeout * 2,
          );

          const value = await promise.onTimeout(
            onTimeout,
            timeout,
          );

          expect(value).toBe(timeoutValue);
          expect(timeoutCbCalled).toBe(true);
        });
      });

      describe('promise rejected...', () => {
        it('in time: reject promise reason', async () => {
          const promise = new ControllablePromise<object, Error>();

          let timeoutCbCalled = false;

          const onTimeout = () => {
            timeoutCbCalled = true;
            return timeoutValue;
          };

          setTimeout(
            () => {
              promise.reject(promiseError);
            },
            timeout / 2,
          );

          await expect(() => promise.onTimeout(
            onTimeout,
            timeout,
          ))
            .rejects
            .toThrow(promiseError);

          expect(timeoutCbCalled).toBe(false);

          // Ensuring that the timeoutCallback is never called
          await wait(timeout);

          expect(timeoutCbCalled).toBe(false);
        });

        it('timed out: resolve timeout callback value', async () => {
          let timeoutCbCalled = false;

          const promise = new ControllablePromise();

          const onTimeout = () => {
            timeoutCbCalled = true;
            return timeoutValue;
          };

          setTimeout(
            () => {
              promise.reject(promiseError);
            },
            timeout * 2,
          );

          expect(await promise.onTimeout(
            onTimeout,
            timeout,
          ))
            .toBe(timeoutValue);

          expect(timeoutCbCalled).toBe(true);
        });
      });
    });

    describe('timeout callback throw error', () => {
      describe('promise resolved...', () => {
        it('in time: resolve promise value', async () => {
          const promise = new ControllablePromise<object>();

          let timeoutCbCalled = false;

          const onTimeout = () => {
            timeoutCbCalled = true;
            throw timeoutError;
          };

          setTimeout(
            () => {
              promise.resolve(promiseValue);
            },
            timeout / 2,
          );

          const value = await promise.onTimeout(
            onTimeout,
            timeout,
          );

          expect(value).toBe(promiseValue);
          expect(timeoutCbCalled).toBe(false);

          // Ensuring that the timeoutCallback is never called
          await wait(timeout);

          expect(timeoutCbCalled).toBe(false);
        });

        it('timed out: reject timeout error', async () => {
          const promise = new ControllablePromise<object>();

          let timeoutCbCalled = false;

          const onTimeout = () => {
            timeoutCbCalled = true;
            throw timeoutError;
          };

          setTimeout(
            () => {
              promise.resolve(promiseValue);
            },
            timeout * 2,
          );

          await expect(() => promise.onTimeout(
            onTimeout,
            timeout,
          ))
            .rejects
            .toThrow(timeoutError);
          expect(timeoutCbCalled).toBe(true);
        });
      });

      describe('promise rejected...', () => {
        it('in time: reject promise reason', async () => {
          const promise = new ControllablePromise<object, Error>();

          let timeoutCbCalled = false;

          const onTimeout = () => {
            timeoutCbCalled = true;
            throw timeoutError;
          };

          setTimeout(
            () => {
              promise.reject(promiseError);
            },
            timeout / 2,
          );

          await expect(() => promise.onTimeout(
            onTimeout,
            timeout,
          ))
            .rejects
            .toThrow(promiseError);

          expect(timeoutCbCalled).toBe(false);

          // Ensuring that the timeoutCallback is never called
          await wait(timeout);

          expect(timeoutCbCalled).toBe(false);
        });

        it('timed out: reject timeout callback error', async () => {
          let timeoutCbCalled = false;

          const promise = new ControllablePromise();

          const onTimeout = () => {
            timeoutCbCalled = true;
            throw timeoutError;
          };

          setTimeout(
            () => {
              promise.reject(promiseError);
            },
            timeout * 2,
          );

          await expect(() => promise.onTimeout(
            onTimeout,
            timeout,
          ))
            .rejects
            .toThrow(timeoutError);

          expect(timeoutCbCalled).toBe(true);
        });
      });
    });
  });

  describe('.raceWith()', () => {
    it('accept empty array', async () => {
      const promise = new ControllablePromise<object>();

      await resolveIn(promise, 100, promiseValue);

      const race = await promise.raceWith([]);

      expect(race).toBe(promiseValue);
    });

    it('accept list of promises', async () => {
      const promise = new ControllablePromise<object>();
      const promiseA = new ControllablePromise<object>();
      const promiseB = new ControllablePromise<object>();

      await resolveIn(promiseA, 100, promiseValue);

      const race = await promise.raceWith([promiseA, promiseB]);

      expect(race).toBe(promiseValue);
    });
  });
});

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

async function resolveIn<U>(promise: ControllablePromise<U>, duration: number, value: U) {
  await wait(duration);
  promise.resolve(value);
}
