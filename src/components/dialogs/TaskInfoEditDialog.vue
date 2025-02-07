<script setup lang="ts">
import { TaskResponse } from "@/models/task/types";
import { ValidationError } from "@/models/validation";

interface Props {
  taskData: TaskResponse;
  isDialogVisible: boolean;
}

interface Emit {
  (e: "submit", value: TaskResponse): void;
  (e: "update:isDialogVisible", val: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emit>();
const error = ref<ValidationError>({});
const taskData = ref<TaskResponse>(structuredClone(toRaw(props.taskData)));

watch(props, () => {
  taskData.value = structuredClone(toRaw(props.taskData));
});

const onFormSubmit = () => {
  emit("update:isDialogVisible", false);
  emit("submit", taskData.value);
};

const onFormReset = () => {
  taskData.value = structuredClone(toRaw(props.taskData));
  emit("update:isDialogVisible", false);
};

const dialogModelValueUpdate = (val: boolean) => {
  emit("update:isDialogVisible", val);
};
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-10 pa-2">
      <VCardText>
        <h4 class="text-h4 text-center mb-2">Edit Task</h4>
        <p class="text-body-1 text-center mb-6">
          Update the details of your task.
        </p>

        <VForm class="mt-6" @submit.prevent="onFormSubmit">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="taskData.title"
                label="Title"
                placeholder="Enter task title"
                :rules="[requiredValidator]"
                :error="!!error.title"
                :error-messages="error.title ? error.title[0] : ''"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="taskData.description"
                label="Description"
                placeholder="Enter task description"
                multiline
              />
            </VCol>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="taskData.due_date"
                label="Due Date"
                placeholder="YYYY-MM-DD"
                type="date"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect
                v-model="taskData.status"
                :items="['PENDIENTE', 'COMPLETADO', 'OBSERVADO']"
                label="Status"
              />
            </VCol>
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit"> Submit </VBtn>
              <VBtn color="secondary" variant="tonal" @click="onFormReset">
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
