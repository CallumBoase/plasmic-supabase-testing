const simulatedMutateFromUseSWR = async (mutateFunction) => {
  console.log(typeof mutateFunction);
  return await mutateFunction();
}

async function addRow() {

  //Simulate 1s delay
  await new Promise(r => setTimeout(r, 1000));

  const data = [{some_field_value: 'fetched'}];

  if(Math.random > 0.5) {
    throw new Error('Random error');
  }

  return data;

}

async function addRowElAction() {
  const errorHandler = (error, calledFrom) => {
    console.log('call handleErrorFunc initiated by' + calledFrom);
    return {
      errorId: Math.random(),
      summary: 'Error adding row',
      errorObject: error
    }
  }

  function myMutateFunction() {
    return simulatedMutateFromUseSWR(
      addRow
      // async function() { console.log('a')}
      // addRow().then(data => ({data, error: null})).catch(error => errorHandler(error, 'mutateFunction catch block'))
    )
  }

  myMutateFunction();
}

// addRowElAction();

async function something() {
  return 'a'
}

function isAsyncFunction(fn) {
  return fn.constructor.name === 'AsyncFunction';
}

console.log('async function without calling it = async function')
console.log(typeof something);
console.log(isAsyncFunction(something));
console.log(something instanceof Promise);

console.log('async function called = promise')
console.log(typeof something())
console.log(isAsyncFunction(something()));
console.log(something() instanceof Promise);

console.log('async function called and chained = promise')
console.log(typeof something().then(() => {}));
console.log(isAsyncFunction(something().then(() => {})));
console.log(something().then(() => {}) instanceof Promise);

