class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
      unordered_map<int, int> heap;
      for(int i = 0; i < nums.size(); i++) {
        int val = target - nums[i];
        if(heap.count(val)) {
          return {heap[val], i};
        }
        heap[nums[i]] = i;
      }
      return {};
    }
};