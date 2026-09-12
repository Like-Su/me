class ArrayList:

    def __init__(self, size=4, compare=None):
        self.size = size
        self.used = 0
        self.data = [None] * size
        self.compare = compare


    # ============================================================
    # 扩容
    # ============================================================

    def extend(self):
        new_size = 1 if self.size == 0 else self.size * 2

        new_data = [None] * new_size

        for i in range(self.used):
            new_data[i] = self.data[i]

        self.data = new_data

        self.size = new_size


    # ============================================================
    # 获取元素
    # ============================================================

    def get(self, index):
        if index < 0 or index >= self.used:
            return None

        return self.data[index]


    # ============================================================
    # push
    # ============================================================

    def push(self, value):
        if self.used >= self.size:
            self.extend()

        self.data[self.used] = value

        self.used += 1


    # ============================================================
    # pop
    # ============================================================

    def pop(self):
        if self.used == 0:
            return None

        index = self.used - 1

        value = self.data[index]

        self.data[index] = None

        self.used -= 1

        return value


    # ============================================================
    # remove
    # ============================================================

    def remove(self, index):
        if index < 0 or index >= self.used:
            return False

        for i in range(index, self.used - 1):
            self.data[i] = self.data[i + 1]

        self.data[self.used - 1] = None

        self.used -= 1

        return True


    # ============================================================
    # sort
    # ============================================================

    def sort(self):
        if self.used <= 1:
            return True

        if self.compare is None:
            return False

        for i in range(self.used - 1):

            min_index = i

            for j in range(i + 1, self.used):

                current = self.data[j]

                minimum = self.data[min_index]

                if self.compare(current, minimum) < 0:
                    min_index = j

            if min_index != i:
                self.swap(i, min_index)

        return True


    # ============================================================
    # find
    # ============================================================

    def find(self, value):
        if self.compare is None:
            return -1

        for i in range(self.used):

            element = self.data[i]

            if self.compare(element, value) == 0:
                return i

        return -1


    # ============================================================
    # swap
    # ============================================================

    def swap(self, a, b):
        self.data[a], self.data[b] = \
            self.data[b], self.data[a]


    # ============================================================
    # reverse
    # ============================================================

    def reverse(self):

        left = 0

        right = self.used - 1

        while left < right:

            self.swap(left, right)

            left += 1

            right -= 1


    # ============================================================
    # rotate
    # ============================================================

    def rotate(self, k):

        if self.used <= 1:
            return

        k %= self.used

        if k == 0:
            return

        self.reverse_range(0, k - 1)

        self.reverse_range(k, self.used - 1)

        self.reverse_range(0, self.used - 1)


    # ============================================================
    # reverse range
    # ============================================================

    def reverse_range(self, left, right):

        while left < right:

            self.swap(left, right)

            left += 1

            right -= 1


    # ============================================================
    # concat
    # ============================================================

    def concat(self, other):

        for i in range(other.used):

            self.push(other.data[i])


    # ============================================================
    # clear
    # ============================================================

    def clear(self):

        for i in range(self.used):
            self.data[i] = None

        self.used = 0


    # ============================================================
    # length
    # ============================================================

    def length(self):
        return self.used


    # ============================================================
    # capacity
    # ============================================================

    def capacity(self):
        return self.size


    # ============================================================
    # 转换成 Python list
    # ============================================================

    def to_list(self):
        return self.data[:self.used]