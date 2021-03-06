import { NodePathService } from 'vs/kendryte/vs/services/path/node/nodePathService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { INodePathService } from 'vs/kendryte/vs/platform/common/type';

registerSingleton(INodePathService, NodePathService);