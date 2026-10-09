// Fiber Node Struct
import { Props, Key, Ref } from 'shared/ReactTypes'
import { WorkType } from './workTags'
import { Flags, NoFlags } from './fiberFlags';

export class FiberNode {
  tag: WorkType;
  pendingProps: Props;
  memoizedProps: Props | null;
  key: Key;
  ref: Ref;
  type: any;
  stateNode: any;
  return: FiberNode | null;
  sibling: FiberNode | null;
  child: FiberNode | null;
  index: number;

  alternate: FiberNode | null;
  flags: Flags;

  constructor(tag: WorkType, pendingProps: Props, key: Key) {
    this.tag = tag;
    this.key = key;

    // 当前 节点
    this.stateNode = null;
    // 当前 fiber node 类型
    this.type = null;


    // 标识节点关系
    this.return = null; // 指向 父 fiberNode 
    this.sibling = null; // 指向 兄弟 fiberNode 
    this.child = null; // 指向 子 fiberNode 
    this.index = 0;

    this.ref = null;

    // 工作单元
    this.pendingProps = pendingProps;
    this.memoizedProps = null; // 工作完毕后的 Props


    this.alternate = null;
    // 副作用
    this.flags = NoFlags;
  }
}