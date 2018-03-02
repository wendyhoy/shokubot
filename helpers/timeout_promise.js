function timeoutPromise(milliseconds) {
  return new Promise(resolve => {
    setTimeout(() => {
        resolve();
      },
      milliseconds
    );
  });
}

module.exports = timeoutPromise
