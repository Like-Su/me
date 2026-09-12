import java.util.Comparator;

public class ArrayList<T> {

    private Object[] data;

    private int size;

    private int used;

    private Comparator<T> comparator;


    public ArrayList() {
        this(4, null);
    }


    public ArrayList(int size, Comparator<T> comparator) {
        if (size < 0) {
            throw new IllegalArgumentException("size cannot be negative");
        }

        this.size = size;
        this.used = 0;
        this.data = new Object[size];
        this.comparator = comparator;
    }


    /**
     * 扩容
     */
    private void extend() {
        int newSize = size == 0 ? 1 : size * 2;

        Object[] newData = new Object[newSize];

        System.arraycopy(
            data,
            0,
            newData,
            0,
            used
        );

        data = newData;

        size = newSize;
    }


    /**
     * 获取元素
     */
    @SuppressWarnings("unchecked")
    public T get(int index) {
        if (index < 0 || index >= used) {
            return null;
        }

        return (T) data[index];
    }


    /**
     * 推入元素
     */
    public void push(T value) {
        if (used >= size) {
            extend();
        }

        data[used] = value;

        used++;
    }


    /**
     * 弹出最后一个元素
     */
    public T pop() {
        if (used == 0) {
            return null;
        }

        int index = used - 1;

        T value = get(index);

        data[index] = null;

        used--;

        return value;
    }


    /**
     * 删除元素
     */
    public boolean remove(int index) {
        if (index < 0 || index >= used) {
            return false;
        }

        int count = used - index - 1;

        if (count > 0) {
            System.arraycopy(
                data,
                index + 1,
                data,
                index,
                count
            );
        }

        data[used - 1] = null;

        used--;

        return true;
    }


    /**
     * 排序
     *
     * 选择排序
     */
    public boolean sort() {
        if (used <= 1) {
            return true;
        }

        if (comparator == null) {
            return false;
        }

        for (int i = 0; i < used - 1; i++) {

            int minIndex = i;

            for (int j = i + 1; j < used; j++) {

                T current = get(j);

                T min = get(minIndex);

                if (comparator.compare(current, min) < 0) {
                    minIndex = j;
                }
            }

            if (minIndex != i) {
                swap(i, minIndex);
            }
        }

        return true;
    }


    /**
     * 查找
     */
    public int find(T value) {
        if (comparator == null) {
            return -1;
        }

        for (int i = 0; i < used; i++) {

            T element = get(i);

            if (comparator.compare(element, value) == 0) {
                return i;
            }
        }

        return -1;
    }


    /**
     * 交换
     */
    private void swap(int a, int b) {

        Object temp = data[a];

        data[a] = data[b];

        data[b] = temp;
    }


    /**
     * 反转
     */
    public void reverse() {

        int left = 0;

        int right = used - 1;

        while (left < right) {

            swap(left, right);

            left++;

            right--;
        }
    }


    /**
     * 左旋
     */
    public void rotate(int k) {

        if (used <= 1) {
            return;
        }

        k %= used;

        if (k == 0) {
            return;
        }

        reverseRange(0, k - 1);

        reverseRange(k, used - 1);

        reverseRange(0, used - 1);
    }


    /**
     * 反转指定区间
     */
    private void reverseRange(int left, int right) {

        while (left < right) {

            swap(left, right);

            left++;

            right--;
        }
    }


    /**
     * 拼接
     */
    public void concat(ArrayList<T> other) {

        for (int i = 0; i < other.used; i++) {

            push(other.get(i));
        }
    }


    /**
     * 清空
     *
     * 保留底层容量
     */
    public void clear() {

        for (int i = 0; i < used; i++) {
            data[i] = null;
        }

        used = 0;
    }


    public int length() {
        return used;
    }


    public int capacity() {
        return size;
    }


    @Override
    public String toString() {

        StringBuilder builder = new StringBuilder();

        builder.append("[");

        for (int i = 0; i < used; i++) {

            if (i > 0) {
                builder.append(", ");
            }

            builder.append(data[i]);
        }

        builder.append("]");

        return builder.toString();
    }
}