import React from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function UpdateExpense() {
    const [categoryName, setCategoryName] = React.useState('');
    const [categories, setCategories] = React.useState([]);
    const [amount, setAmount] = React.useState('');
    const [date, setDate] = React.useState('');
    const [expenseDescription, setExpenseDescription] = React.useState('');
    const [necessity, setNecessity] = React.useState('');
    const {id} = useParams(); //useParams is a hook provided by react-router-dom that allows us to access the parameters of the current route. In this case, we are using it to extract the id parameter from the URL, which represents the ID of the expense record that we want to update. This ID will be used in the API request to identify which expense record to update in the backend.
    const navigate = useNavigate(); //useNavigate is a hook provided by react-router-dom that allows us to programmatically navigate to different routes in our application. In this component, we will use it to navigate back to the /expense page after successfully updating the expense record, so that the user can see the updated list of expenses.
    
    
    function handleSubmit(event) {
        event.preventDefault(); //doesn't reload the page when the form is submitted, allowing us to handle the form submission with JavaScript instead of the default browser behavior.
        let necessityValue = null;
        if (necessity === 'true') {
          necessityValue = 1;
        } else {
          necessityValue = 0;
        }
        axios.put(`http://localhost:8081/update/${id}`, {    
            category_name: categoryName,
            amount: amount,
            date: date,
            expense_description: expenseDescription,
            necessity: necessityValue
        })
        .then(res => {console.log(res.data);
        navigate('/expense');}) //naviage to the /expenses page after the expense is successfully created
        .catch(err => console.log(err));
    }

    React.useEffect(() => {
    axios.get(`http://localhost:8081/expense/${id}`)
    .then(res => {
      const exp = res.data;
      setCategoryName(exp.category_name);
      setAmount(exp.amount);
      setDate(exp.date.split('T')[0]); // remove time part
      setExpenseDescription(exp.expense_description);
      setNecessity(exp.necessity ? 'true' : 'false');
    })
    .catch(err => console.log(err));

    axios.get('http://localhost:8081/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.log(err));
}, [id]);

    return (
        <div className='d-flex flex-column vh-100 bg-success-subtle justify-content-center align-items-center'>
            <h1 style={{ fontFamily: 'Bursh Script MT, cursive', color: '#ec88e7', textAlign: 'center', marginBottom: '20px' }}>Expense Tracker</h1>
            <div className ='w-100 bg-white rounded p-3'>
                <h1 style={{ fontFamily: 'cursive', textAlign: 'center', marginBottom: '20px' }}>Update Expense</h1>
                <form onSubmit = {handleSubmit}>
                    <div className='mb-2'>
                        <label htmlFor='category_name'>Category Name</label>
                        <select className='form-control' onChange={e => setCategoryName(e.target.value)} value={categoryName}>
                            <option value=''>Select category</option>
                            {categories.map((cat) => (
                                <option key={cat.category_id} value={cat.category_name}>{cat.category_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='amount'>Amount</label>
                        <input type='number' placeholder='Enter amount' className='form-control' 
                        onChange={e => setAmount(e.target.value)} value={amount}
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='date'>Date</label>
                        <input type='date' placeholder='Enter date' className='form-control' 
                        onChange={e => setDate(e.target.value)} value={date}
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='expense_description'>Expense Description</label>
                        <input type='text' placeholder='Enter expense description' className='form-control' 
                        onChange={e => setExpenseDescription(e.target.value)} value={expenseDescription}
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='necessity'>Necessity</label>
                        <select className='form-control' onChange={e => setNecessity(e.target.value)} value={necessity}>
                            <option value=''>Select necessity</option>
                            <option value='true'>True</option>
                            <option value='false'>False</option>
                        </select>
                    </div>
                    <button className='btn btn-success'>Update</button>
                </form>
            </div>
        </div>
    )
}

export default UpdateExpense