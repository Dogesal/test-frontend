<script setup lang="ts">
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { VForm } from "vuetify/components/VForm";
import { ValidationError } from "@/models/validation";
import { User, UserResponse } from "@/models/user/types";

interface Emit {
  (e: "update:isDrawerOpen", value: boolean): void;
  (e: "userData", value: UserResponse): void;
}

interface Props {
  isDrawerOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<Emit>();
const error = ref<ValidationError>({});
const isPasswordVisible = ref(false);
const isFormValid = ref(false);
const refForm = ref<VForm>();
const form = reactive({
  imagen: null as File | null,  // Inicializamos como null, esperando un archivo
  currentAvatar: "",
  name: "",
  email: "",
  password: null,
});

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit("update:isDrawerOpen", false);

  nextTick(() => {
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
};

// Manejo del cambio de imagen
const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files ? input.files[0] : null;
  if (file) {
    form.imagen = file;
  }
};


const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      const formData = new FormData();
      
      // Agrega los valores del formulario al FormData
      formData.append("name", form.name);
      formData.append("email", form.email);
      if (form.password) {
        formData.append("password", form.password);
      }

      // Asegúrate de que `form.imagen` sea el archivo subido
      if (form.imagen instanceof File) {
        formData.append("imagen", form.imagen);
      }

      emit("userData", formData);
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
      title="Add New User"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              
              <!-- 👉 Avatar -->
              <VCol cols="12">
                <label for="image-upload" class="block mb-2 text-sm font-medium">Imagen</label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  @change="handleImageChange"
                  class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
                />
                <div v-if="form.currentAvatar">
                  <img :src="form.currentAvatar" alt="Current Avatar" class="mt-2 w-16 h-16 rounded-full" />
                </div>
                <span v-if="!!error.imagen" class="text-red-500 text-xs">{{ error.imagen[0] }}</span>
              </VCol>

              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  :rules="[requiredValidator]"
                  label="Name"
                  placeholder="John Doe"
                  :error="!!error.name"
                  :error-messages="error.name ? error.name[0] : ''"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  placeholder="johndoe@email.com"
                  :error="!!error.email"
                  :error-messages="error.email ? error.email[0] : ''"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  :rules="[requiredValidator]"
                  label="Password"
                  :error="!!error.password"
                  :error-messages="error.password ? error.password[0] : ''"
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
