import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import Navbar from '../components/Navbar';
import { Plus, Search, Filter, Trash2, Edit2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        sort_by: 'created_at',
        sort_order: 'desc'
    });
    const [showModal, setShowModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const params = {
                skip: (page - 1) * 20,
                limit: 20,
                ...filters
            };

            // Remove empty filters
            if (!params.status) delete params.status;
            if (!params.search) delete params.search;

            const response = await taskService.getTasks(params);
            setTasks(response.data.items);
            setTotalPages(response.data.pages);

            // Also fetch stats
            const statsRes = await taskService.getStats();
            setStats(statsRes.data);

        } catch (error) {
            console.error("Failed to fetch tasks", error);
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [page, filters.sort_by, filters.sort_order]); // Trigger on page/sort change

    // Debounced search/filter effect would go here in prod, simplified for now
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on filter change
            fetchTasks();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search, filters.status]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskService.deleteTask(id);
                toast.success('Task deleted');
                fetchTasks();
            } catch (error) {
                toast.error('Failed to delete task');
            }
        }
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (currentTask) {
                await taskService.updateTask(currentTask.id, data, currentTask.version);
                toast.success('Task updated');
            } else {
                await taskService.createTask(data);
                toast.success('Task created');
            }
            setShowModal(false);
            setCurrentTask(null);
            fetchTasks();
        } catch (error) {
            if (error.response?.status === 409) {
                toast.error('Task was modified by someone else. Refreshing...');
                fetchTasks();
            } else {
                toast.error('Failed to save task');
            }
        }
    };

    const openEditModal = (task) => {
        setCurrentTask(task);
        setShowModal(true);
    };

    const openCreateModal = () => {
        setCurrentTask(null);
        setShowModal(true);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-800';
            case 'HIGH': return 'bg-orange-100 text-orange-800';
            case 'MEDIUM': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-purple-100 text-purple-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats Section */}
                {stats && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                                <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.in_progress}</dd>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                                <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.completed}</dd>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">To Do</dt>
                                <dd className="mt-1 text-3xl font-semibold text-purple-600">{stats.todo}</dd>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex-1 w-full sm:max-w-md relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="input-field pl-10"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <div className="flex w-full sm:w-auto gap-2">
                        <select
                            className="input-field w-auto"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Status</option>
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>

                        <button
                            onClick={openCreateModal}
                            className="btn btn-primary flex items-center whitespace-nowrap"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            New Task
                        </button>
                    </div>
                </div>

                {/* Task List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {loading ? (
                            <li className="px-6 py-12 text-center text-gray-500">Loading tasks...</li>
                        ) : tasks.length === 0 ? (
                            <li className="px-6 py-12 text-center text-gray-500">
                                No tasks found. Create one to get started!
                            </li>
                        ) : (
                            tasks.map((task) => (
                                <li key={task.id}>
                                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-medium text-primary-600 truncate">{task.title}</p>
                                                    <div className="ml-2 flex-shrink-0 flex gap-2">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                                            {task.priority}
                                                        </span>
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex justify-between">
                                                    <div className="sm:flex">
                                                        <p className="flex items-center text-sm text-gray-500">
                                                            {task.description || "No description"}
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 gap-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => openEditModal(task)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(task.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-secondary text-sm"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn btn-secondary text-sm"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleSaveTask}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        {currentTask ? 'Edit Task' : 'New Task'}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title</label>
                                            <input
                                                name="title"
                                                type="text"
                                                required
                                                defaultValue={currentTask?.title}
                                                className="input-field mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                name="description"
                                                rows="3"
                                                defaultValue={currentTask?.description}
                                                className="input-field mt-1"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Priority</label>
                                                <select
                                                    name="priority"
                                                    defaultValue={currentTask?.priority || 'MEDIUM'}
                                                    className="input-field mt-1"
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="URGENT">Urgent</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                                <select
                                                    name="status"
                                                    defaultValue={currentTask?.status || 'TODO'}
                                                    className="input-field mt-1"
                                                >
                                                    <option value="TODO">To Do</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="COMPLETED">Completed</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
