export function createEvent<T>() {
  const _listeners: Array<(sender: any, args: T) => void> = [];

  const subscribe = (listener: (sender: any, args: T) => void): void => {
    _listeners.push(listener);
  };

  const unsubscribe = (listener: (sender: any, args: T) => void): void => {
    const index = _listeners.findIndex((x) => x === listener);
    if (index !== -1) _listeners.splice(index, 1);
  };

  const notify = (sender: any, args: T) => {
    _listeners.forEach((x) => x(sender, args));
  };

  return { event: { subscribe, unsubscribe }, notify };
}
