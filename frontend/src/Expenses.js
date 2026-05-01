import React, { useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { render } from '@testing-library/react';

function Expenses() {
  const [data, setData] = React.useState([]); //data holds the expense records fetched from the backend
  const [report, setReport] = React.useState(''); //filter holds the current value of the filter input
  const [selectedCategory, setSelectedCategory] = React.useState('Select Report Value'); //selectedCategory holds the currently selected category for generating the report, which is used to filter the expenses displayed in the report based on the user's selection from the dropdown menu.
  const [categories, setCategories] = React.useState([]); //categories holds the list of categories fetched from the backend, which can be used to populate dropdowns or other UI elements that require category information.
  useEffect(() => {
    axios.get('http://34.63.225.128:8081/expense')
      .then(res => setData(res.data))
      .catch(err => console.log(err));
    axios.get('http://34.63.225.128:8081/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.log(err));
  }, []); //the [] dependency array ensures that the effect runs only once when the component mounts, preventing unnecessary re-fetching of data on every render.

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://34.63.225.128:8081/delete/${id}`);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }   
  };

  const handleReportChange = (value) => {
    if (value === '') {
      setReport(null); //clear report if the user didn't select anything 
      return;
    }

    axios.get(`http://34.63.225.128:8081/report?category_name=${value}`)
      .then(res => setReport(res.data))
      .catch(err => console.log(err));
  };

  const closeReport = () => {
    setReport(null);
    setSelectedCategory(''); // This resets the dropdown
  };

  const renderReport = () => {
    if (!report) {
      return null;
    }

    const overlayStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(82, 136, 101, 0.6)', // Dark semi-transparent background
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1050, // Ensure the overlay is above other content
    };

    const contentStyle = {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      color: '#333'
    };

    if (report.length === 0) {
      return (
        <div style={overlayStyle}>
          <div style={contentStyle}>
            <p>No data available for the selected category.</p>
            <button className='btn btn-secondary' onClick={closeReport}>Close</button>
          </div>
        </div>
      );
    }
    return (
      <div style={overlayStyle}>
        <div style={contentStyle}>
          <h2>Report for category: {report[0].category_name}</h2>
          <table className='table'>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Necessity</th>
              </tr>
            </thead>
            <tbody>
              {report.map((item, index) => (
                <tr key={index}>
                  <td>{item.category_name}</td>
                  <td>{item.amount}</td>
                  <td>{item.date.split('T')[0]}</td>
                  <td>{item.expense_description}</td>
                  <td>{item.necessity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className='btn btn-secondary' onClick={closeReport}>Close</button>
        </div>
      </div>
    );
  };

  return (
    <div className='d-flex flex-column vh-100 bg-success-subtle justify-content-center align-items-center'>
      <h1 style={{ fontFamily: 'Bursh Script MT, cursive', color: '#ec88e7', textAlign: 'center', marginBottom: '20px' }}>Expense Tracker</h1>
      {renderReport()}
      <div className='w-100 bg-white rounded p-3'>
        <Link to="/create" className='btn btn-success'>Add +</Link>
        <select
          className='form-control mb-3'
          value={selectedCategory}
          onChange={(e) =>
          {
            setSelectedCategory(e.target.value);
            handleReportChange(e.target.value)}}
        >
          <option value=''>Select Report Value</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_name}>{cat.category_name}</option>
          ))} 
        </select>

        <table className='table'>
          <thead>
            <tr>
              <th>expense_id</th>
              <th>category_name</th>
              <th>amount</th>
              <th>date</th>
              <th>expense_description</th>
              <th>necessity</th>
            </tr>
          </thead>
          <tbody>
            {data.map((expense) => (
              <tr key={expense.expense_id}>
                <td>{expense.expense_id}</td>
                <td>{expense.category_name}</td>
                <td>{expense.amount}</td>
                <td>{expense.date.split('T')[0]}</td> 
                <td>{expense.expense_description}</td>
                <td>{expense.necessity}</td>
                <td>
                  <div className='d-flex gap-2'>    
                    <Link to={`/update/${expense.expense_id}`} className='btn btn-primary btn-sm'>Update</Link>
                    <button className='btn btn-danger btn-sm ms-2' onClick={e => handleDelete(expense.expense_id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Expenses;