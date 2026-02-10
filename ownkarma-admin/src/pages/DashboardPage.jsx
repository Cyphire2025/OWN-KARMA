import React, { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import axios from 'axios';

const DashboardPage = () => {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        revenue: 0,
        customers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In a real app, you would fetch these from your backend
                // For now, we'll simulate or fetch product count
                const productsRes = await axios.get('http://localhost:5000/api/products');

                setStats({
                    products: productsRes.data.length || 0,
                    orders: 12, // Placeholder
                    revenue: 12500, // Placeholder
                    customers: 45 // Placeholder
                });
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon size={32} className="text-white" />
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-black mt-1">{value}</h3>
            </div>
        </div>
    );

    if (loading) {
        return <div className="p-10 text-center text-gray-400">Loading dashboard...</div>;
    }

    return (
        <div className="p-2">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">Dashboard</h1>
                <p className="text-gray-400 text-lg">Welcome back to your store overview.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Products"
                    value={stats.products}
                    icon={Package}
                    color="bg-black"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders}
                    icon={ShoppingCart}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.revenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Active Customers"
                    value={stats.customers}
                    icon={Users}
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Activity Placeholder */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-black mb-6">Recent Activity</h2>
                <div className="bg-gray-50 rounded-[24px] p-8 text-center border border-gray-100">
                    <p className="text-gray-400">No recent activity to show.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
