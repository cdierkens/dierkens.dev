class ___Signal<Value = unknown> {
  constructor(
    private _value: Value,
    private handlers: Function[] = [],
  ) {}
  subscribe(fn: (value: Value) => void) {
    this.handlers.push(fn);

    fn(this._value);

    return this.handlers.length - 1;
  }

  unsubscribe(fn: (value: Value) => void) {
    const index = this.handlers.indexOf(fn);

    if (index === -1) {
      return;
    }

    this.handlers.splice(index, 1);
  }

  get value() {
    return this._value;
  }

  set value(_value: Value) {
    this._value = _value;

    this.handlers.forEach((fn) => fn(_value));
  }

  toString() {
    return String(this._value);
  }

  valueOf() {
    return this._value;
  }
}

const _Signal = function __Signal<TValue>(
  ...args: ConstructorParameters<typeof ___Signal<TValue>>
) {
  return new ___Signal<TValue>(...args);
};
_Signal.prototype = ___Signal.prototype;

export const Signal = Object.assign(_Signal, ___Signal);
export type Signal<Value = unknown> = ___Signal<Value>;
