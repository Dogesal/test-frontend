<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router/auto'
import { TaskResponse } from '@/models/task/types'
import { UserResponse } from '@/models/user/types'
import AddNewTaskDrawer from '@/views/apps/task/list/AddNewTaskDrawer.vue'
import { useApi } from '@/composables/useApi' // Asegúrate de que este composable esté correctamente implementado
import { watch, onMounted } from 'vue'

const route = useRoute<'task-list-id_user'>()
const router = useRouter()
const userId = route.params.id_user // Asegurar que sea string
console.log("ID del usuario:", userId)

// Reactive state
const searchQuery = ref('')
const selectedStatus = ref<string | null>(null)
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref<string | null>(null)
const orderBy = ref<string | null>(null)

const updateOptions = (options: any) => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Description', key: 'description' },
  { title: 'Due Date', key: 'due_date' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]
interface ThemeSwitcherTheme {
  name: 'system' | 'light' | 'dark'
  icon: string
}

const themes: ThemeSwitcherTheme[] = [
  { name: 'system', icon: 'mdi-laptop' },
  { name: 'light', icon: 'mdi-weather-sunny' },
  { name: 'dark', icon: 'mdi-weather-night' },
]

const formatDate = (dateString: string | null): string => {
  if (!dateString) return ''
  return new Date(dateString).toISOString().split('T')[0]
}

const queryParams = new URLSearchParams({
  id_user: userId || "0", // Evitar valores vacíos

}).toString();


// Fetching tasks with user filter


const { data: usersTask, execute: fetchUser } = useApi<any>(`/users/${userId}`)




const totalTasks = computed((): TaskResponse[] => {
  return usersTask.value?.data?.tasks?.map((task: TaskResponse) => ({
    ...task,
    due_date: formatDate(task.due_date),
  })) || []
})



const taskEdit = ref<TaskResponse>({} as TaskResponse)

const statusOptions = [
  { title: 'PENDIENTE', value: 'PENDIENTE' },
  { title: 'COMPLETADO', value: 'COMPLETADO' },
  { title: 'OBSERVADO', value: 'OBSERVADO' },
]


const isAddNewTaskDrawerVisible = ref(false)
const isTaskInfoEditDialogVisible = ref(false)

const addNewTask = async (taskData: TaskResponse) => {
  try {
    const requestData = {
      ...taskData,
      id_user: userId,
    }

    console.log(JSON.stringify(requestData))
    await $api('/tasks', {
      method: 'POST',

      body: JSON.stringify(requestData),
    })
    fetchUser()
  } catch (error) {
    console.error("Error adding task:", error)
  }
}




const editTask = async (taskData: TaskResponse) => {
  try {
    console.log("Enviando actualización para la tarea:", JSON.stringify(taskData, null, 2))

    await $api(`/tasks/${taskData.id_task}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    })

    console.log("Tarea actualizada con éxito")
    fetchUser() // Actualizar la lista después de editar
  } catch (error) {
    console.error("Error updating task:", error)
  }
}


const deleteTask = async (id_task: number) => {
  try {
    await $api(`/tasks/${id_task}`, {
      method: 'DELETE',
    })
    fetchUser() // Refetch tasks after deletion
  } catch (error) {
    console.error("Error deleting task:", error)
  }
}

const getTask = async (id_task: number) => {
  try {
    console.log("Obteniendo tarea con ID:", id_task)

    const { data } = await $api(`/tasks/${id_task}`, {
      method: 'GET',
    })

    console.log("Tarea obtenida:", data)
    taskEdit.value = data

    isTaskInfoEditDialogVisible.value = true
  } catch (error) {
    console.error("Error fetching task:", error)
  }
}

const getStatusColor = (dueDate: string | null): string => {
  if (!dueDate) return 'error'

  const today = new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
  const taskDate = new Date(dueDate).toISOString().split('T')[0]

  if (taskDate < today) return 'error'    // Tarea vencida (rojo)
  if (taskDate === today) return 'warning' // Tarea vence hoy (naranja)
  return 'success'  // Tarea aún tiene tiempo (verde)
}



</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Filters</VCardTitle>
      </VCardItem>
      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppSelect
              v-model="selectedStatus"
              placeholder="Select Status"
              :items="statusOptions"
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
        <div class="app-task-search-filter d-flex align-center flex-wrap gap-4">
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search Task"
            />
          </div>
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewTaskDrawerVisible = true"
          >
            Add New Task
          </VBtn>
        </div>
      </VCardText>
      <VDivider />
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="totalTasks"
        :items-length="totalTasks.length"
        :headers="headers"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >

        <template #item.status="{ item }">
          <VBtn
            :color="getStatusColor(item.due_date)"
            size="small"
            variant="tonal"
          >
            {{ item.status }}
          </VBtn>
        </template>


        <template #item.actions="{ item }">
          <IconBtn @click="deleteTask(item.id_task)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
          <IconBtn @click="getTask(item.id_task)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalTasks.length"
          />
        </template>
      </VDataTableServer>
    </VCard>
    <AddNewTaskDrawer
      v-model:isDrawerOpen="isAddNewTaskDrawerVisible"
      @task-data="addNewTask"
    />
    <TaskInfoEditDialog
      v-model:isDialogVisible="isTaskInfoEditDialogVisible"
      :task-data="taskEdit"
      @submit="editTask"
    />

  </section>
</template>
