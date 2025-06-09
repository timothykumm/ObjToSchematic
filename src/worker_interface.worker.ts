import { doWork } from './worker';

addEventListener('message', async (e) => {
    const result = await doWork(e.data);
    postMessage(result);
});
