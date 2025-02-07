<script setup lang="ts">
import { UserResponse } from '@/models/user/types'
import AddNewUserDrawer from '@/views/apps/user/list/AddNewUserDrawer.vue'
import {router} from "@/plugins/1.router";

// 👉 Store
const searchQuery = ref('')
const selectedRole = ref()
const selectedPlan = ref()
const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

// Update data table options
const updateOptions = (options: any) => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

// Headers
const headers = [
{ title: 'Imagen', key: 'imagen' },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Created At', key: 'created_at' },
  { title: 'Updated At', key: 'updated_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0]; // Extrae solo "yyyy-mm-dd"
};

// 👉 Fetching users
const { data: usersData, execute: fetchUsers } = await useApi<any>(createUrl('/users', {
  query: {
    q: searchQuery,
    status: selectedStatus,
    plan: selectedPlan,
    role: selectedRole,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const users = computed((): UserResponse[] => {
  return usersData.value.data.map(user => ({
    ...user,
    created_at: formatDate(user.created_at),
    updated_at: formatDate(user.updated_at),
  }))
})
const totalUsers = computed(() => usersData.value.data?.length)
const userEdit = ref<UserResponse>({} as UserResponse)



// 👉 search filters
const roles = [
  { title: 'Admin', value: 'admin' },
  { title: 'Author', value: 'author' },
  { title: 'Editor', value: 'editor' },
  { title: 'Maintainer', value: 'maintainer' },
  { title: 'Subscriber', value: 'subscriber' },
]

const plans = [
  { title: 'Basic', value: 'basic' },
  { title: 'Company', value: 'company' },
  { title: 'Enterprise', value: 'enterprise' },
  { title: 'Team', value: 'team' },
]

const status = [
  { title: 'Pending', value: 'pending' },
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
]

const resolveUserRoleVariant = (role: string) => {
  const roleLowerCase = role.toLowerCase()

  if (roleLowerCase === 'subscriber')
    return { color: 'success', icon: 'tabler-user' }
  if (roleLowerCase === 'author')
    return { color: 'error', icon: 'tabler-device-desktop' }
  if (roleLowerCase === 'maintainer')
    return { color: 'info', icon: 'tabler-chart-pie' }
  if (roleLowerCase === 'editor')
    return { color: 'warning', icon: 'tabler-edit' }
  if (roleLowerCase === 'admin')
    return { color: 'primary', icon: 'tabler-crown' }

  return { color: 'primary', icon: 'tabler-user' }
}

const resolveUserStatusVariant = (stat: string) => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'pending')
    return 'warning'
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'

  return 'primary'
}

const isAddNewUserDrawerVisible = ref(false)
const isUserInfoEditDialogVisible = ref(false)

// 👉 Add new user
const addNewUser = async (userData: UserResponse) => {
  await $api('/users', {
    method: 'POST',
    body: userData,
  })

  // refetch User
  fetchUsers()
}

const editUser = async (userData: UserResponse) => {
  const formData = new FormData();
  formData.append("_method", "PUT"); // Simulación del método PUT
  formData.append("name", userData.name);
  formData.append("email", userData.email);

  if (userData.password) {
    formData.append("password", userData.password);
  }

  if (userData.imagen && userData.imagen instanceof File) {
    formData.append("imagen", userData.imagen);
  }

  try {
    await $api(`/users/${userData.id_user}`, {
      method: "POST",
      body: formData,
    });

    // Refetch User
    fetchUsers();
  } catch (error) {
    console.error("Error al editar usuario:", error);
  }
};

// 👉 Delete user
const deleteUser = async (id_user: number) => {
  await $api(`/users/${id_user}`, {
    method: 'DELETE',
  })

  // refetch User
  // TODO: Make this async
  fetchUsers()
}

const getUser = async (id_user: number) => {
  const { data, status } = await $api(`/users/${id_user}`, {
    method: 'GET',
  })
  if(!status) return
  userEdit.value = data;
  isUserInfoEditDialogVisible.value = true;
}

const viewUserTasks = (id_user?: number) => {
  if (id_user === undefined) {
    console.error('Error: id_user es undefined');
    return;
  }

  router.push({
    name: 'task-list-id_user',
    params: { id_user: String(id_user) }, // Convertimos id_user a string
  });
};




const widgetData = ref([
  { title: 'Session', value: '21,459', change: 29, desc: 'Total Users', icon: 'tabler-users', iconColor: 'primary' },
  { title: 'Paid Users', value: '4,567', change: 18, desc: 'Last Week Analytics', icon: 'tabler-user-plus', iconColor: 'error' },
  { title: 'Active Users', value: '19,860', change: -14, desc: 'Last Week Analytics', icon: 'tabler-user-check', iconColor: 'success' },
  { title: 'Pending Users', value: '237', change: 42, desc: 'Last Week Analytics', icon: 'tabler-user-search', iconColor: 'warning' },
])
</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <template
          v-for="(data, id_user) in widgetData"
          :key="id_user"
        >
          <VCol
            cols="12"
            md="3"
            sm="6"
          >
            <VCard>
              <VCardText>
                <div class="d-flex justify-space-between">
                  <div class="d-flex flex-column gap-y-1">
                    <div class="text-body-1 text-high-emphasis">
                      {{ data.title }}
                    </div>
                    <div class="d-flex gap-x-2 align-center">
                      <h4 class="text-h4">
                        {{ data.value }}
                      </h4>
                      <div
                        class="text-base"
                        :class="data.change > 0 ? 'text-success' : 'text-error'"
                      >
                        ({{ prefixWithPlus(data.change) }}%)
                      </div>
                    </div>
                    <div class="text-sm">
                      {{ data.desc }}
                    </div>
                  </div>
                  <VAvatar
                    :color="data.iconColor"
                    variant="tonal"
                    rounded
                    size="42"
                  >
                    <VIcon
                      :icon="data.icon"
                      size="26"
                    />
                  </VAvatar>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </template>
      </VRow>
    </div>

    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Filters</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- 👉 Select Role -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedRole"
              placeholder="Select Role"
              :items="roles"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Plan -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedPlan"
              placeholder="Select Plan"
              :items="plans"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Status -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStatus"
              placeholder="Select Status"
              :items="status"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'All' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search User"
            />
          </div>

          <!-- 👉 Export button -->
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-upload"
          >
            Export
          </VBtn>

          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewUserDrawerVisible = true"
          >
            Add New User
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="users"
        :items-length="totalUsers"
        :headers="headers"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >

        <!-- Imagen de usuario -->
        <template #item.imagen="{ item }">
          <img :src="item.imagen" alt="User Image" width="50" height="50" style="border-radius: 8px;" />
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="deleteUser(item.id_user)">
            <VIcon icon="tabler-trash" />
          </IconBtn>

          <IconBtn @click="getUser(item.id_user)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>

          <IconBtn @click="viewUserTasks(item.id_user)">
            <VIcon icon="tabler-list" />
          </IconBtn>

        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalUsers"
          />
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New User -->
    <AddNewUserDrawer
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      @user-data="addNewUser"
    />

    <UserInfoEditDialog
      v-model:isDialogVisible="isUserInfoEditDialogVisible"
      :user-data="userEdit"
      @submit="editUser"
    />
  </section>
</template>
