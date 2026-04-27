<template>
  <div class="properties-panel">
    <!-- 未选中状态 -->
    <div v-if="!selectedObject" class="empty-hint">
      <el-icon :size="40"><InfoFilled /></el-icon>
      <span>点击场景中的对象查看属性</span>
    </div>

    <!-- 已选中状态 -->
    <template v-else>
      <!-- 基本信息 -->
      <div class="section">
        <div class="section-title">基本信息</div>
        <div class="section-body">
          <div class="form-row">
            <label class="form-label">名称</label>
            <div class="form-input-group">
              <el-input
                v-model="objectName"
                size="small"
                placeholder="对象名称"
                @change="handleNameChange"
              />
              <el-button
                type="primary"
                size="small"
                :icon="Check"
                :loading="isSavingName"
                @click="handleNameSave"
              >
                保存
              </el-button>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">类型</label>
            <el-tag size="small" type="info">{{ objectTypeLabel }}</el-tag>
          </div>
          <div class="form-row">
            <label class="form-label">ID</label>
            <span class="form-value">{{ selectedObject.id }}</span>
          </div>
        </div>
      </div>

      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab" class="props-tabs">
        <!-- 变换属性标签页 -->
        <el-tab-pane label="变换属性" name="transform">
          <div class="transform-section">
            <!-- Position -->
            <div class="transform-group">
              <div class="transform-group-title">Position</div>
              <div class="transform-row">
                <span class="axis-label axis-x">X</span>
                <el-input-number
                  :model-value="selectedObject.position[0]"
                  size="small"
                  :controls="false"
                  :precision="3"
                  @change="(val: number) => handlePositionChange(0, val)"
                />
              </div>
              <div class="transform-row">
                <span class="axis-label axis-y">Y</span>
                <el-input-number
                  :model-value="selectedObject.position[1]"
                  size="small"
                  :controls="false"
                  :precision="3"
                  @change="(val: number) => handlePositionChange(1, val)"
                />
              </div>
              <div class="transform-row">
                <span class="axis-label axis-z">Z</span>
                <el-input-number
                  :model-value="selectedObject.position[2]"
                  size="small"
                  :controls="false"
                  :precision="3"
                  @change="(val: number) => handlePositionChange(2, val)"
                />
              </div>
            </div>

            <!-- Rotation -->
            <div class="transform-group">
              <div class="transform-group-title">Rotation</div>
              <div class="transform-row">
                <span class="axis-label axis-x">X</span>
                <el-input-number
                  :model-value="selectedObject.rotation[0]"
                  size="small"
                  :controls="false"
                  :precision="2"
                  @change="(val: number) => handleRotationChange(0, val)"
                />
              </div>
              <div class="transform-row">
                <span class="axis-label axis-y">Y</span>
                <el-input-number
                  :model-value="selectedObject.rotation[1]"
                  size="small"
                  :controls="false"
                  :precision="2"
                  @change="(val: number) => handleRotationChange(1, val)"
                />
              </div>
              <div class="transform-row">
                <span class="axis-label axis-z">Z</span>
                <el-input-number
                  :model-value="selectedObject.rotation[2]"
                  size="small"
                  :controls="false"
                  :precision="2"
                  @change="(val: number) => handleRotationChange(2, val)"
                />
              </div>
            </div>

            <!-- Scale -->
            <div class="transform-group">
              <div class="transform-group-title">Scale</div>
              <div class="transform-row">
                <span class="axis-label axis-x">X</span>
                <el-input-number
                  :model-value="selectedObject.scale[0]"
                  size="small"
                  :controls="false"
                  :precision="3"
                  :min="0.001"
                  @change="(val: number) => handleScaleChange(0, val)"
                />
              </div>
              <div class="transform-row">
                <span class="axis-label axis-y">Y</span>
                <el-input-number
                  :model-value="selectedObject.scale[1]"
                  size="small"
                  :controls="false"
                  :precision="3"
                  :min="0.001"
                  @change="(val: number) => handleScaleChange(1, val)"
                />
              </div>
              <div class="transform-row">
                <span class="axis-label axis-z">Z</span>
                <el-input-number
                  :model-value="selectedObject.scale[2]"
                  size="small"
                  :controls="false"
                  :precision="3"
                  :min="0.001"
                  @change="(val: number) => handleScaleChange(2, val)"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 业务属性标签页 -->
        <el-tab-pane label="业务属性" name="properties">
          <div class="business-props">
            <template v-if="propertiesEntries.length > 0">
              <div
                v-for="entry in propertiesEntries"
                :key="entry.key"
                class="prop-item"
              >
                <label class="prop-key">{{ entry.key }}</label>

                <!-- 字符串 / 数字类型 -->
                <el-input
                  v-if="entry.type === 'string' || entry.type === 'number'"
                  :model-value="String(entry.value)"
                  size="small"
                  :type="entry.type === 'number' ? 'number' : 'text'"
                  @change="(val: string) => handlePropertyChange(entry.key, entry.type === 'number' ? Number(val) : val)"
                />

                <!-- 布尔类型 -->
                <el-switch
                  v-else-if="entry.type === 'boolean'"
                  :model-value="entry.value"
                  size="small"
                  @change="(val: boolean) => handlePropertyChange(entry.key, val)"
                />

                <!-- 数组类型 -->
                <div v-else-if="entry.type === 'array'" class="prop-array">
                  <el-table
                    :data="entry.value"
                    size="small"
                    border
                    class="array-table"
                  >
                    <el-table-column
                      v-for="(_, colIdx) in (entry.value[0] ? Object.keys(entry.value[0]).length : 1)"
                      :key="colIdx"
                      :label="`列 ${colIdx + 1}`"
                      min-width="80"
                    >
                      <template #default="{ row, $index }">
                        <el-input
                          :model-value="getArrayValue(row, colIdx)"
                          size="small"
                          @change="(val: string) => handleArrayItemChange(entry.key, $index, colIdx, val)"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="50" align="center">
                      <template #default="{ $index }">
                        <el-button
                          type="danger"
                          size="small"
                          link
                          @click="handleArrayItemRemove(entry.key, $index)"
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-button
                    size="small"
                    class="add-row-btn"
                    @click="handleArrayItemAdd(entry.key, entry.value)"
                  >
                    + 添加行
                  </el-button>
                </div>

                <!-- 其他类型 -->
                <el-input
                  v-else
                  :model-value="JSON.stringify(entry.value)"
                  size="small"
                  @change="(val: string) => handlePropertyChange(entry.key, val)"
                />
              </div>
            </template>

            <div v-else class="empty-props">
              <span>暂无业务属性</span>
            </div>

            <!-- 添加属性按钮 -->
            <div class="add-prop-row">
              <el-button size="small" @click="showAddPropertyDialog">
                + 添加属性
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>

    <!-- 添加属性对话框 -->
    <el-dialog
      v-model="addPropertyDialogVisible"
      title="添加属性"
      width="360px"
      :append-to-body="true"
    >
      <el-form label-width="80px" size="small">
        <el-form-item label="属性名">
          <el-input v-model="newPropKey" placeholder="请输入属性名" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="newPropType" style="width: 100%">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔" value="boolean" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认值">
          <el-input
            v-model="newPropValue"
            :placeholder="newPropType === 'boolean' ? 'true / false' : '请输入默认值'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="addPropertyDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="handleAddProperty">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { InfoFilled, Delete, Check } from '@element-plus/icons-vue'
import { useEditorStore } from '@/stores/editorStore'

const editorStore = useEditorStore()

const selectedObject = computed(() => editorStore.selectedObject)
const activeTab = ref('transform')
const objectName = ref('')

// 添加属性对话框
const addPropertyDialogVisible = ref(false)
const newPropKey = ref('')
const newPropType = ref<'string' | 'number' | 'boolean'>('string')
const newPropValue = ref('')

// 防抖定时器
let transformDebounceTimer: ReturnType<typeof setTimeout> | null = null
const isSavingName = ref(false)

// 对象类型标签
const objectTypeMap: Record<string, string> = {
  model: '模型',
  light: '灯光',
  camera: '相机',
  helper: '辅助工具',
  group: '分组',
}

const objectTypeLabel = computed(() => {
  if (!selectedObject.value) return ''
  return objectTypeMap[selectedObject.value.objectType] || selectedObject.value.objectType
})

// 同步对象名称
watch(
  () => selectedObject.value?.name,
  (name) => {
    objectName.value = name || ''
  },
  { immediate: true },
)

// 业务属性条目
const propertiesEntries = computed(() => {
  const props = selectedObject.value?.properties
  if (!props || typeof props !== 'object') return []
  return Object.entries(props).map(([key, value]) => ({
    key,
    value,
    type: getPropType(value),
  }))
})

function getPropType(value: unknown): string {
  if (value === null || value === undefined) return 'string'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (Array.isArray(value)) return 'array'
  return 'string'
}

// 名称变更（本地实时更新）
function handleNameChange() {
  if (!selectedObject.value) return
  const obj = editorStore.sceneObjects.find(o => o.id === selectedObject.value!.id)
  if (obj) obj.name = objectName.value
}

// 名称保存到服务端
async function handleNameSave() {
  if (!selectedObject.value || !objectName.value.trim()) return
  isSavingName.value = true
  try {
    await editorStore.updateObjectProperties(selectedObject.value.id, {
      _name: objectName.value.trim(),
    })
  } catch (err) {
    console.error('保存名称失败:', err)
  } finally {
    isSavingName.value = false
  }
}

// Position 变更
function handlePositionChange(index: number, val: number) {
  if (!selectedObject.value) return
  const pos = [...selectedObject.value.position]
  pos[index] = val
  editorStore.updateObjectTransform(selectedObject.value.id, {
    position: pos,
    rotation: [...selectedObject.value.rotation],
    scale: [...selectedObject.value.scale],
  })
  debouncedSaveTransform(selectedObject.value.id)
}

// Rotation 变更
function handleRotationChange(index: number, val: number) {
  if (!selectedObject.value) return
  const rot = [...selectedObject.value.rotation]
  rot[index] = val
  editorStore.updateObjectTransform(selectedObject.value.id, {
    position: [...selectedObject.value.position],
    rotation: rot,
    scale: [...selectedObject.value.scale],
  })
  debouncedSaveTransform(selectedObject.value.id)
}

// Scale 变更
function handleScaleChange(index: number, val: number) {
  if (!selectedObject.value) return
  const scl = [...selectedObject.value.scale]
  scl[index] = val
  editorStore.updateObjectTransform(selectedObject.value.id, {
    position: [...selectedObject.value.position],
    rotation: [...selectedObject.value.rotation],
    scale: scl,
  })
  debouncedSaveTransform(selectedObject.value.id)
}

// 防抖保存变换到服务端
function debouncedSaveTransform(objectId: number) {
  if (transformDebounceTimer) {
    clearTimeout(transformDebounceTimer)
  }
  transformDebounceTimer = setTimeout(() => {
    editorStore.saveObjectTransform(objectId).catch((err) => {
      console.error('保存变换失败:', err)
    })
  }, 500)
}

// 业务属性变更
function handlePropertyChange(key: string, value: unknown) {
  if (!selectedObject.value) return
  editorStore.updateObjectProperties(selectedObject.value.id, {
    [key]: value,
  }).catch((err) => console.error('更新属性失败:', err))
}

// 获取数组项的值
function getArrayValue(row: any, colIdx: number): string {
  if (typeof row === 'object' && row !== null) {
    const keys = Object.keys(row)
    return String(row[keys[colIdx]] ?? '')
  }
  // 简单数组
  return String(Array.isArray(row) ? row[colIdx] ?? '' : row)
}

// 数组项变更
function handleArrayItemChange(propKey: string, rowIdx: number, colIdx: number, val: string) {
  if (!selectedObject.value) return
  const props = { ...(selectedObject.value.properties || {}) }
  const arr = [...(props[propKey] || [])]
  const item = arr[rowIdx]

  if (typeof item === 'object' && item !== null) {
    const keys = Object.keys(item)
    arr[rowIdx] = { ...item, [keys[colIdx]]: val }
  } else {
    arr[rowIdx] = val
  }

  editorStore.updateObjectProperties(selectedObject.value.id, {
    [propKey]: arr,
  }).catch((err) => console.error('更新数组属性失败:', err))
}

// 数组项删除
function handleArrayItemRemove(propKey: string, rowIdx: number) {
  if (!selectedObject.value) return
  const props = { ...(selectedObject.value.properties || {}) }
  const arr = [...(props[propKey] || [])]
  arr.splice(rowIdx, 1)
  editorStore.updateObjectProperties(selectedObject.value.id, {
    [propKey]: arr,
  }).catch((err) => console.error('删除数组项失败:', err))
}

// 数组项添加
function handleArrayItemAdd(propKey: string, currentArray: unknown[]) {
  if (!selectedObject.value) return
  const arr = [...currentArray]
  if (arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null) {
    // 对象数组：添加一个空对象
    const template: Record<string, string> = {}
    Object.keys(arr[0] as object).forEach((k) => {
      template[k] = ''
    })
    arr.push(template)
  } else {
    // 简单数组：添加空字符串
    arr.push('')
  }
  editorStore.updateObjectProperties(selectedObject.value.id, {
    [propKey]: arr,
  }).catch((err) => console.error('添加数组项失败:', err))
}

// 显示添加属性对话框
function showAddPropertyDialog() {
  newPropKey.value = ''
  newPropType.value = 'string'
  newPropValue.value = ''
  addPropertyDialogVisible.value = true
}

// 确认添加属性
function handleAddProperty() {
  if (!selectedObject.value || !newPropKey.value.trim()) return
  let value: unknown = newPropValue.value
  if (newPropType.value === 'number') {
    value = Number(newPropValue.value) || 0
  } else if (newPropType.value === 'boolean') {
    value = newPropValue.value.toLowerCase() === 'true'
  }
  editorStore.updateObjectProperties(selectedObject.value.id, {
    [newPropKey.value.trim()]: value,
  }).then(() => {
    addPropertyDialogVisible.value = false
  }).catch((err) => console.error('添加属性失败:', err))
}
</script>

<style scoped>
.properties-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color);
  overflow-y: auto;
}

.empty-hint {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.section {
  border-bottom: 1px solid var(--el-border-color);
}

.section-title {
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  background: var(--el-fill-color);
}

.section-body {
  padding: 10px 14px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-label {
  width: 48px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.form-input-group {
  display: flex;
  gap: 6px;
  flex: 1;
}

.form-input-group .el-input {
  flex: 1;
}

.form-value {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: var(--font-mono);
}

.props-tabs {
  flex: 1;
  padding: 0 10px;
}

.props-tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}

.props-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

/* 变换属性 */
.transform-section {
  padding: 4px 0;
}

.transform-group {
  margin-bottom: 12px;
}

.transform-group:last-child {
  margin-bottom: 0;
}

.transform-group-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.transform-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.transform-row:last-child {
  margin-bottom: 0;
}

.axis-label {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  border-radius: 3px;
  flex-shrink: 0;
}

.axis-x {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.15);
}

.axis-y {
  color: #51cf66;
  background: rgba(81, 207, 102, 0.15);
}

.axis-z {
  color: #22b8cf;
  background: rgba(34, 184, 207, 0.15);
}

.transform-row :deep(.el-input-number) {
  width: 100%;
}

.transform-row :deep(.el-input__inner) {
  text-align: center;
  font-family: var(--font-mono);
  font-size: 12px;
}

/* 业务属性 */
.business-props {
  padding: 4px 0;
}

.prop-item {
  margin-bottom: 10px;
}

.prop-key {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.prop-array {
  margin-top: 4px;
}

.array-table {
  width: 100%;
}

.add-row-btn {
  margin-top: 6px;
  width: 100%;
}

.empty-props {
  text-align: center;
  padding: 20px 0;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.add-prop-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
