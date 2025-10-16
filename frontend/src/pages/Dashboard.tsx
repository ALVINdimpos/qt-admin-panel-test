import { useState } from "react";
import { Plus, Users, BarChart3, Shield, Activity } from "lucide-react";
import { useVerifiedUsers } from "@/features/users/hooks/useVerifiedUsers";
import { useCreateUser, useUpdateUser, useDeleteUser } from "@/features/users/hooks/useUserMutations";
import { Users7dChart } from "@/features/dashboard/components/Users7dChart";
import { UsersTable } from "@/features/users/components/UsersTable";
import { UserForm } from "@/features/users/components/UserForm";
import type { UserRow } from "@/services/users";

export default function Dashboard() {
  const { data, isLoading, error } = useVerifiedUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: UserRow) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: { email: string; role: string; status: string }) => {
    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          userId: editingUser.id,
          data: formData,
        });
      } else {
        await createUserMutation.mutateAsync(formData);
      }
      setShowForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const isFormLoading = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <header className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">QT Admin Dashboard</h1>
                <p className="text-blue-100 mt-1">
                  Monitor user activity and verify cryptographic signatures
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">{data?.length || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Active Users</p>
                    <p className="text-2xl font-bold text-green-900">
                      {data?.filter(u => u.status === 'active').length || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600">Admin Users</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {data?.filter(u => u.role === 'admin').length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Chart Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Users Created (Last 7 Days)
                </h2>
                <p className="text-sm text-gray-600">Track user registration trends</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <Users7dChart />
          </div>
        </section>

        {/* Enhanced Users Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Verified Users
                  </h2>
                  <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {data && (
                  <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                      {data.length} verified user{data.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleCreateUser}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create User
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600 font-medium">Loading verified users...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load users</h3>
                  <p className="text-red-500">Please try again later</p>
                </div>
              </div>
            )}
            
            {data && (
              <UsersTable 
                data={data} 
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            )}
          </div>
        </section>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isFormLoading}
        />
      )}
    </div>
  );
}
