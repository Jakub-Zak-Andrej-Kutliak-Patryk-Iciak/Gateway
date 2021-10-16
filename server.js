import path from 'path';
import gateway from 'express-gateway';

import './microservices/auth.js';
import './microservices/user.js';

gateway()
  .load(path.join(path.dirname(''), 'config'))
  .run();
