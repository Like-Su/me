import { filter, map, Subject } from 'rxjs';

const stream$ = new Subject<number>()

stream$.subscribe(v => {
  console.log(`subscribe1: ${v}`)
})


stream$.subscribe(v => {
  console.log(`subscribe2: ${v}`)
  console.log();
})

stream$.next(1)

setTimeout(() => {
  stream$.next(2)
}, 1000)

setTimeout(() => {
  stream$.next(3);
}, 2000);

const stream$2 = new Subject<number>()

const result$ = stream$2.pipe(map(x => x * x)).pipe(filter(x => x % 2 !== 0))

result$.subscribe((v) => {
  console.log(`监听者1: ${v}`)
});

result$.subscribe((v) => {
  console.log(`监听者2: ${v}`)
});

stream$2.next(1);

setTimeout(() => {
  stream$2.next(2);
}, 1000);

setTimeout(() => {
  stream$2.next(3);
}, 2000);