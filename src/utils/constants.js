export const UserRoleEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member"
}


export const AvailableUserRole = Object.values(UserRoleEnum)

export const TaskStatusEnum = {
  TODO: "todo",
  INPROGRESS: "in_progress",
  DONE: "done"
}

export const AvailableTaskStatuses = Object.values(TaskStatusEnum);