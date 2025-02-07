<script setup lang="ts">
import { UserResponse } from "@/models/user/types";
import { ValidationError } from "@/models/validation";

interface Props {
  userData: UserResponse;
  isDialogVisible: boolean;
}

interface Emit {
  (e: "submit", value: UserResponse): void;
  (e: "update:isDialogVisible", val: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emit>();
const error = ref<ValidationError>({});
const userData = ref<UserResponse>(structuredClone(toRaw(props.userData)));
const isPasswordVisible = ref(false);
const imagePreview = ref<string | null>(userData.value.imagen || null);

watch(props, () => {
  userData.value = structuredClone(toRaw(props.userData));
  imagePreview.value = userData.value.imagen || null;
});

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files ? input.files[0] : null;

  if (file) {
    userData.value.imagen = file;
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const onFormSubmit = () => {
  if (userData.value.imagen) {
    console.log("Imagen seleccionada: ", userData.value.imagen);
  }
  emit("update:isDialogVisible", false);
  emit("submit", userData.value);
};

const onFormReset = () => {
  userData.value = structuredClone(toRaw(props.userData));
  imagePreview.value = userData.value.imagen || null;
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
        <h4 class="text-h4 text-center mb-2">Edit User Information</h4>
        <p class="text-body-1 text-center mb-6">
          Updating user details will receive a privacy audit.
        </p>

        <VForm class="mt-6" @submit.prevent="onFormSubmit">
          <VRow>
            <VCol cols="12" class="d-flex flex-column align-center">
              <label for="image-upload" class="block mb-2 text-sm font-medium">Image</label>
              <div v-if="imagePreview" class="mb-2">
                <img :src="imagePreview" alt="User Image" class="w-32 h-32 object-cover rounded-full border-2 border-gray-300" />
              </div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                @change="handleImageChange"
                class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
              />
              <span v-if="error.imagen" class="text-red-500 text-xs">{{ error.imagen[0] }}</span>
            </VCol>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="userData.name"
                label="First Name"
                placeholder="John"
                :rules="[requiredValidator]"
                :error="!!error.name"
                :error-messages="error.name ? error.name[0] : ''"
              />
            </VCol>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="userData.email"
                label="Email"
                placeholder="johndoe@email.com"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="userData.password"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                label="Password"
                :error="!!error.password"
                :error-messages="error.password ? error.password[0] : ''"
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
