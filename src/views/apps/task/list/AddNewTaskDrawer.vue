<script setup lang="ts">
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { VForm } from "vuetify/components/VForm";
import { ValidationError } from "@/models/validation";
import { Task } from "@/models/task/types";

interface Emit {
  (e: "update:isDrawerOpen", value: boolean): void;
  (e: "taskData", value: Task): void;
}

interface Props {
  isDrawerOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<Emit>();
const error = ref<ValidationError>({});
const isFormValid = ref(false);
const refForm = ref<VForm>();
const form = reactive({
  id_user: null as number | null,
  title: "",
  description: "",
  due_date: "",
  status: "PENDIENTE" as 'PENDIENTE' | 'COMPLETADO' | 'OBSERVADO',
});

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit("update:isDrawerOpen", false);

  nextTick(() => {
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
};

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit("taskData", { ...form });
      emit("update:isDrawerOpen", false);

      nextTick(() => {
        refForm.value?.reset();
        refForm.value?.resetValidation();
      });
    }
  });
};

const handleDrawerModelValueUpdate = (val: boolean) => {
  if (!val) {
    refForm.value?.reset(); // Resetea el formulario si el drawer se cierra
  }
  emit("update:isDrawerOpen", val);
};
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Add New Task"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              <!-- 👉 Title -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.title"
                  label="Title"
                  placeholder="Task title"
                  :error="!!error.title"
                  :error-messages="error.title ? error.title[0] : ''"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- 👉 Description -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.description"
                  label="Description"
                  placeholder="Task description"
                  :error="!!error.description"
                  :error-messages="error.description ? error.description[0] : ''"
                  :rules="[]"
                  multiline
                  rows="3"
                />
              </VCol>

              <!-- 👉 Due Date -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.due_date"
                  label="Due Date"
                  type="date"
                  :error="!!error.due_date"
                  :error-messages="error.due_date ? error.due_date[0] : ''"
                  :rules="[]"
                />
              </VCol>

              <!-- 👉 Status -->
              <VCol cols="12">
                <VSelect
                  v-model="form.status"
                  :items="['PENDIENTE', 'COMPLETADO', 'OBSERVADO']"
                  label="Status"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn type="submit" class="me-3"> Submit </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
