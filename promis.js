let promise = new Promise( (resolve, reject) => {
    console.log('First function');
}).then( 
    console.log('aaaa')
)

console.log('A')
setTimeout(function(){},1000)
promise
    .then(
        result => {
            console.log('Second Function')
        },
    ).then(
        result => {
            console.log('3 functon')
            for (i=0; i < 1000; i++){
                a = i*5/(i+1);
            }
        }
    ).then(
        result => {
            console.log('4')
        }
    )
console.log('B')

let promise_1 = new Promise( (resolve, reject) => {
    helloworld();
    resolve('a');
}).then(a => {
        console.log('world');
        for(i = 0; i < 221311331; i++){
            a = a*(i+1)
        }
        // setInterval(helloworld,1000);
    }
).then( a => {
    console.log('test')
    }
)

function helloworld(){
 console.log('hello')
}
