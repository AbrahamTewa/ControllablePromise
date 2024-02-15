// ============================================================
// Class
class ControllablePromise<T = void, E = unknown> extends Promise<T> {
  readonly createdAt = new Date();

  readonly reject: (reason: E) => void = rejectUnknownError<T, E>;

  readonly resolve: (value: T) => void = resolveUnknownError<T, E>;

  constructor(init?: InitPromise<T, E>) {
    let resolve = resolveUnknownError<T, E>;
    let reject = rejectUnknownError<T, E>;

    super((resolveCb, rejectCb) => {
      resolve = resolveCb;
      reject = rejectCb;

      if (init) {
        init(resolve, reject);
      }
    });

    this.resolve = resolve;
    this.reject = reject;
  }

  callbackResolver(...args: [err: E] | [err: E, value: T]): void {
    const [err, value] = args;

    if (err) {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      this.reject(err);
    } else {
      this.resolve(value as T);
    }
  }

  async onTimeout<U = void>(
    cb: () => (U | Promise<U>),
    timeout: number,
  ): Promise<T | U> {
    let timedOut = false;
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<U>((resolve, reject) => {
      timeoutId = setTimeout(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async () => {
          timedOut = true;
          try {
            const value = await cb();
            resolve(value);
          } catch (err) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(err);
          }
        },
        timeout,
      );
    });

    const resolve = async (value: T) => {
      if (timedOut) {
        return timeoutPromise;
      }

      clearTimeout(timeoutId);
      return value;
    };

    const reject = async (reason: E) => {
      if (timedOut) {
        return timeoutPromise;
      }

      clearTimeout(timeoutId);
      timedOut = true;
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw reason;
    };

    const value = await Promise.race([
      this.then(resolve, reject),
      timeoutPromise,
    ]);

    return value;
  }

  /**
   * Race the promise with other promises
   * @param promises
   * @returns The race result
   */
  async raceWith<U>(promises: PromiseLike<U>[]): Promise<T | U> {
    const race = Promise.race([
      this,
      ...promises,
    ]);

    return race;
  }

  static createFrom<T, E = unknown>(promise: Promise<T>): ControllablePromise<T, E> {
    const controllablePromise = new ControllablePromise<T, E>();

    promise.then(
      (value) => {
        controllablePromise.resolve(value);
      },
      (reason: E) => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        controllablePromise.reject(reason);
      },
    );

    return controllablePromise;
  }
}

// ============================================================
// Helpers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function resolveUnknownError<T, E>(value: T): void {
  throw new Error('Unexpected error');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function rejectUnknownError<T, E>(value: E): void {
  throw new Error('Unexpected error');
}

// ============================================================
// Types
type InitPromise<T, E = unknown> = (
  resolve: (val: T) => void,
  reject: (reason: E) => void,
) => void;

// ============================================================
// Exports
export default ControllablePromise;
export {
  rejectUnknownError,
  resolveUnknownError,
};
