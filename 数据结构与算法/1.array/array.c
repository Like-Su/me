#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stddef.h>
#include <stdbool.h>
#include <stdint.h>
#include <limits.h>


typedef struct Array {
	
	// 数组容量
	size_t size;
	
	// 已使用容量
	size_t used;
	
	// 数据类型大小
	size_t typeSize;
	
	/**
	 * @brief 值复制
	 * @param dest 目标指针
	 * @param src 源指针
	 */
	void (*copy)(void *dest, const void *src);
	
	/**
	 * @brief 释放数组元素占用的资源
	 * @param value 数组元素指针
	 */
	void (*destroy)(void *value);
	
	/**
	 * @brief 比较两个元素
	 * @param a 第一个元素指针
	 * @param b 第二个元素指针
	 * @return
	 *         0  表示相等
	 *        -1  表示第一个元素小于第二个元素
	 *         1  表示第一个元素大于第二个元素
	 */
	int (*compare)(const void *a, const void *b);
	
	// 存放数据的指针
	void *data;
	
} Array;


// 默认策略

void ArrayDefaultCopy(void *dest,const void *src,size_t typeSize) {
	memcpy(dest,src,typeSize);
}


/**
 * @brief 默认释放策略
 *
 * 普通数据类型不需要额外释放资源。
 */
void ArrayDefaultDestroy(void *value) {
	(void)value;
}


int ArrayDefaultCompare(const void *a,const void *b) {
	return a == b ? 1 : 0;
}


// 初始化
void initArray(
			   Array *array,
			   size_t size,
			   size_t typeSize,
			   void (*copy)(void *,const void *),
			   void (*destory)(void *),
			   int (*compare)(const void *,const void *)
			   ) {
	if (array == NULL) return;
	
	if (typeSize == 0) {
		fprintf(stderr,"typeSize cannot be 0\n");
		exit(EXIT_FAILURE);
	}
	
	/*
	* 防止：
	*
	* size * typeSize
	*
	* 整数溢出。
	*/
	if (size > SIZE_MAX / typeSize) {
		fprintf(stderr,"array size overflow\n");
		exit(EXIT_FAILURE);
	}
	
	/* -------------------------
	* 基础信息初始化
	* ------------------------- */
	
	array->size = size;
	array->used = 0;
	array->typeSize = typeSize;
	
	/* -------------------------
	* 操作策略
	* ------------------------- */
	
	array->copy =
	copy != NULL
	? copy
	: ArrayDefaultCopy;
	
	array->destroy =
	destory != NULL
	? destory
	: ArrayDefaultDestroy;
	
	/*
	* compare 不能真正提供通用默认实现。
	*
	* 如果用户没有提供 compare，
	* 就设置为 NULL。
	*
	* sort / find 时检查。
	*/
	array->compare = compare;
	
	
	if (size == 0) {
		array->data = NULL;
		return;
	}
	
	array->data = malloc(size * typeSize);
	
	if (array->data == NULL) {
		fprintf(stderr,"malloc failed\n");
		exit(EXIT_FAILURE);
	}
}


/* ============================================================
* 扩容
* ============================================================ */

/**
 * @brief 数组扩容
 *
 * 容量：
 *
 * 1 → 2 → 4 → 8 → 16 ...
 *
 * 时间复杂度：
 *
 * O(N)
 */
bool extend(Array *array) {
	if (array == NULL) return false;
	
	/*
	* 扩容两倍
	*/
	size_t newSize =
	array->size == 0
	? 1
	: array->size * 2;
	
	/*
	* 防止 newSize * typeSize 溢出
	*/
	if (newSize > SIZE_MAX / array->typeSize) return false;
	
	void *newData = realloc(
							array->data,
							newSize * array->typeSize
							);
	
	if (newData == NULL) return false;
	
	array->data = newData;
	array->size = newSize;
	
	return true;
}


/* ============================================================
* 获取元素
* ============================================================ */

/**
 * @brief 根据下标获取元素
 *
 * 时间复杂度：
 *
 * O(1)
 */
void *ArrayGet(Array *array,size_t index) {
	if (array == NULL) return NULL;
	
	if (index >= array->used) return NULL;
	
	/*
	* 地址计算：
	*
	* data
	*   +
	* index * typeSize
	*/
	return (char *)array->data + index * array->typeSize;
}


/* ============================================================
* push
* ============================================================ */

/**
 * @brief 推入元素
 *
 * 将元素添加到数组尾部。
 *
 * 时间复杂度：
 *
 * 平均 O(1)
 */
bool push(Array *array,const void *value) {
	if (array == NULL || value == NULL) return false;
	
	/*
	* 容量不足
	*/
	if (array->used >= array->size) {
		if (!extend(array)) return false;
	}
	
	/*
	* 找到尾部位置
	*/
	void *target =
	(char *)array->data
	+ array->used * array->typeSize;
	
	/*
	* 复制元素
	*/
	array->copy(target,value);
	
	array->used++;
	
	return true;
}


/* ============================================================
* pop
* ============================================================ */

/**
 * @brief 从尾部弹出元素
 *
 * out != NULL：
 *
 *     将元素复制到 out。
 *
 * out == NULL：
 *
 *     只删除元素。
 */
bool pop(Array *array,void *out) {
	if (array == NULL || array->used == 0) return false;
	
	/*
	* 最后一个元素下标
	*/
	size_t index = array->used - 1;
	
	/*
	* 获取最后一个元素
	*/
	void *target =
	(char *)array->data
	+ index * array->typeSize;
	
	/*
	* 用户需要弹出的元素
	*/
	if (out != NULL) {
		array->copy(out,target);
	}
	
	/*
	* 释放元素内部资源
	*/
	array->destroy(target);
	
	/*
	* 使用数量减少
	*/
	array->used--;
	
	return true;
}


/* ============================================================
* 删除
* ============================================================ */

/**
 * @brief 删除指定下标元素
 *
 * [10][20][30][40]
 *      ↑
 *
 * remove(1)
 *
 * [10][30][40]
 */
bool ArrayRemove(Array *array,size_t index) {
	if (array == NULL || index >= array->used) return false;
	
	/*
	* 找到目标元素
	*/
	void *target =
	(char *)array->data
	+ index * array->typeSize;
	
	/*
	* 先释放目标元素
	*/
	array->destroy(target);
	
	/*
	* 将后面的元素向前移动
	*/
	if (index < array->used - 1) {
		memmove(
				target,
				(char *)target + array->typeSize,
				(array->used - index - 1) * array->typeSize
				);
	}
	
	array->used--;
	
	return true;
}


/* ============================================================
* 交换元素
* ============================================================ */

/**
 * @brief 交换两个元素
 */
static bool ArraySwap(Array *array,size_t a,size_t b) {
	if (array == NULL || a >= array->used || b >= array->used) return false;
	
	if (a == b) return true;
	
	/*
	* 获取两个元素
	*/
	void *left = ArrayGet(array,a);
	void *right = ArrayGet(array,b);
	
	/*
	* 临时空间
	*/
	void *temp = malloc(array->typeSize);
	
	if (temp == NULL) return false;
	
	/*
	* 关键：
	*
	* temp = left
	*
	* 你原来的代码这里漏掉了。
	*/
	array->copy(temp,left);
	
	/*
	* left = right
	*/
	array->copy(left,right);
	
	/*
	* right = temp
	*/
	array->copy(right,temp);
	
	free(temp);
	
	return true;
}


/* ============================================================
* sort
* ============================================================ */

/**
 * @brief 排序
 *
 * 当前使用选择排序。
 *
 * 时间复杂度：
 *
 * O(N²)
 */
bool sort(Array *array) {
	if (array == NULL || array->used <= 1) return true;
	
	/*
	* 没有 compare，
	* 无法排序。
	*/
	if (array->compare == NULL) return false;
	
	for (size_t i = 0;i < array->used - 1;i++) {
		
		/*
		* 假设当前位置是最小值
		*/
		size_t minIndex = i;
		
		for (size_t j = i + 1;j < array->used;j++) {
			void *current = ArrayGet(array,j);
			void *min = ArrayGet(array,minIndex);
			
			if (array->compare(current,min) < 0) {
				minIndex = j;
			}
		}
		
		/*
		* 交换
		*/
		if (minIndex != i) {
			if (!ArraySwap(array,i,minIndex)) return false;
		}
	}
	
	return true;
}


/* ============================================================
* find
* ============================================================ */

/**
 * @brief 查找元素
 *
 * 返回：
 *
 * >= 0 ：元素下标
 * -1   ：没有找到
 *
 * 时间复杂度：
 *
 * O(N)
 */
long find(Array *array,const void *value) {
	if (array == NULL || value == NULL || array->compare == NULL) return -1;
	
	for (size_t i = 0;i < array->used;i++) {
		void *element = ArrayGet(array,i);
		
		if (array->compare(element,value) == 0) {
			return (long)i;
		}
	}
	
	return -1;
}


/* ============================================================
* reverse
* ============================================================ */

/**
 * @brief 原地反转
 *
 * [1 2 3 4 5]
 *
 * ↓
 *
 * [5 4 3 2 1]
 *
 * 时间复杂度：
 *
 * O(N)
 */
bool reverse(Array *array) {
	if (array == NULL || array->used <= 1) return true;
	
	size_t left = 0;
	size_t right = array->used - 1;
	
	while (left < right) {
		if (!ArraySwap(array,left,right)) return false;
		
		left++;
		right--;
	}
	
	return true;
}


/* ============================================================
* rotate
* ============================================================ */

/**
 * @brief 左旋数组
 *
 * [1 2 3 4 5]
 *
 * rotate(array,2)
 *
 * ↓
 *
 * [3 4 5 1 2]
 */
bool rotate(Array *array,size_t k) {
	if (array == NULL || array->used <= 1) return true;
	
	/*
	* 防止 k > used
	*/
	k %= array->used;
	
	if (k == 0) return true;
	
	size_t left = 0;
	size_t right = k - 1;
	
	while (left < right) {
		if (!ArraySwap(array,left,right)) return false;
		
		left++;
		right--;
	}
	
	left = k;
	right = array->used - 1;
	
	while (left < right) {
		if (!ArraySwap(array,left,right)) return false;
		
		left++;
		right--;
	}
	
	/*
	* 整体反转
	*/
	left = 0;
	right = array->used - 1;
	
	while (left < right) {
		if (!ArraySwap(array,left,right)) return false;
		
		left++;
		right--;
	}
	
	return true;
}


/**
 * @brief 拼接两个数组
 */
bool concat(Array *array,const Array *other) {
	if (array == NULL ||other == NULL) return false;
	
	
	/*
	* 两个数组必须是相同元素大小。
	*/
	if (array->typeSize != other->typeSize) return false;
	
	if (other->used > SIZE_MAX - array->used) return false;
	
	size_t required = array->used + other->used;
	
	/*
	* 容量不足则不断扩容。
	*/
	while (array->size < required) {
		if (!extend(array)) {
			return false;
		}
	}
	
	/*
	* 一个元素一个元素复制。
	*/
	for (size_t i = 0;i < other->used;i++) {
		
		void *value = (char *)other->data + i * other->typeSize;
		
		if (!push(array,value)) return false;
	}
	
	return true;
}


/**
 * @brief 清空数组，但是保留容量
 */
void ArrayClear(Array *array) {
	if (array == NULL) return;
	
	/*
	* 释放每一个元素内部资源。
	*/
	if (array->destroy != NULL) {
		
		for (size_t i = 0;i < array->used;i++) {
			void *value =
			(char *)array->data
			+ i * array->typeSize;
			
			array->destroy(value);
		}
	}
	
	array->used = 0;
}


/**
 * @brief 销毁整个 Array
 */
void ArrayFree(Array *array) {
	if (array == NULL) return;
	
	/*
	* 先清理元素。
	*/
	ArrayClear(array);
	
	/*
	* 再释放整个数组。
	*/
	free(array->data);
	
	array->data = NULL;
	array->size = 0;
	array->used = 0;
	array->typeSize = 0;
	array->copy = NULL;
	array->destroy = NULL;
	array->compare = NULL;
}