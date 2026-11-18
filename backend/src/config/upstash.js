import {Redis} from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

//create rate limiter that allows 10 request per 10 seconds
const ratelimit = new Ratelimit({
    redis:Redis.fromEnv(),
    limiter:Ratelimit.slidingWindow(10, "20 s"),
});

export default ratelimit;