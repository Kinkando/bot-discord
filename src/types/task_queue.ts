import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';

export class TaskQueue<T> {
    private taskSubject = new Subject<T>();

    constructor(processTask: (task: T) => Promise<void>) {
        this.taskSubject
            .pipe(concatMap(processTask))
            .subscribe({
                next: (result) => console.log(`Task completed`),
                error: (err) => console.error(`Task failed: ${err}`)
            });
    }

    push(task: T) {
        this.taskSubject.next(task);
    }
}
