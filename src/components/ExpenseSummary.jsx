import React, { useState, useEffect, useCallback } from 'react';
import { expenseAPI } from '../api/expenseApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ExpenseSummary = ({ projectId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allExpenses, setAllExpenses] = useState([]);

  const fetchSummary = useCallback(async () => {
    try {
      // Get both summary and expenses
      const [summaryRes, expensesRes] = await Promise.all([
        expenseAPI.getExpenseSummary(projectId),
        expenseAPI.getProjectExpenses(projectId)
      ]);
      
      const expenses = expensesRes.data.expenses || [];
      setAllExpenses(expenses);
      
      // Calculate totals from expenses by category
      const totalLabor = expenses
        .filter(e => e.categoryName === 'Labor')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      const totalEquipment = expenses
        .filter(e => e.categoryName === 'Equipment')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      const totalExpenses = expenses
        .filter(e => e.categoryName !== 'Labor' && e.categoryName !== 'Equipment')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      const totalAll = totalExpenses + totalLabor + totalEquipment;
      
      setSummary({
        totalExpenses: totalExpenses,
        totalLabor: totalLabor,
        totalEquipment: totalEquipment,
        totalAll: totalAll,
        categoryBreakdown: summaryRes.data.summary?.categoryBreakdown || {}
      });
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Add eslint-disable comment to fix the warning
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary();
  }, [fetchSummary]);

  if (loading) return <div className="loading">Loading summary...</div>;
  if (!summary) return null;

  // Prepare pie chart data from actual expenses
  const categoryTotals = {};
  allExpenses.forEach(expense => {
    const catName = expense.categoryName;
    if (!categoryTotals[catName]) {
      categoryTotals[catName] = 0;
    }
    categoryTotals[catName] += parseFloat(expense.amount);
  });
  
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6'];

  return (
    <div className="expense-summary">
      <h3>Expense Summary</h3>
      
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">📦</div>
          <div className="summary-info">
            <span>Materials & Expenses</span>
            <strong>KES {parseFloat(summary.totalExpenses || 0).toLocaleString()}</strong>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">👷</div>
          <div className="summary-info">
            <span>Labor Costs</span>
            <strong>KES {parseFloat(summary.totalLabor || 0).toLocaleString()}</strong>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">🏗️</div>
          <div className="summary-info">
            <span>Equipment</span>
            <strong>KES {parseFloat(summary.totalEquipment || 0).toLocaleString()}</strong>
          </div>
        </div>
        
        <div className="summary-card total">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <span>Total All Expenses</span>
            <strong>KES {parseFloat(summary.totalAll || 0).toLocaleString()}</strong>
          </div>
        </div>
      </div>
      
      {pieData.length > 0 && (
        <div className="expense-chart">
          <h4>Expense Breakdown by Category</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ExpenseSummary;