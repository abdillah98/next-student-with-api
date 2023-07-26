import {useState, useEffect} from 'react'
import { Inter } from 'next/font/google'
import Input from '../componentsV2/Input'
import Button from '../componentsV2/Button'
import StudentItem from '../componentsV2/StudentItem'
import FormAdd from '../componentsV2/FormAdd'
import FormEdit from '../componentsV2/FormEdit'

const inter = Inter({ subsets: ['latin'] })

const initialForm = {
    id: null, 
    name: '', 
    email: ''
}

export default function StudentList() {

    const [searchField, setSearchField] = useState('')
    const [isOpenAdd, setIsOpenAdd] = useState(false)
    const [isOpenEdit, setIsOpenEdit] = useState(false)
    const [form, setForm] = useState(initialForm)
    const [students, setStudents] = useState([])
    const [isLoading, setIsloading] = useState(true)


    const handleShowAdd = (e) => {
        setIsOpenAdd(true)
        setForm(initialForm)
    }
    
    const handleChange = (e) => {
        const {value, name} = e.target
        setForm(prev => ({...prev, [name]: value}))
    }

    const handleGetAll = async () => {
        //Call API...
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`)
        const {data} = await response.json()
        setStudents(data)
        setIsloading(false)
    }

    const handleAddNew = async (e) => {
        e.preventDefault()
        setIsloading(true)

        try {
            const requestOptions = {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(form)
            };

            //Call API...
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, requestOptions)
            const {message} = await response.json();

            //get response message...
            console.log(message)

            //Refresh students data...
            await handleGetAll()
        }
        catch(err) {
            console.log('Error:', err);
        }

        setIsloading(false)
        setIsOpenAdd(false)
        setForm(initialForm)
    }

    const handleShowDetails = (student) => {
        setForm(student)
        setIsOpenEdit(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setIsloading(true)

        try {
            const requestOptions = {
              method: 'PUT',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(form)
            };
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${form.id}`, requestOptions)
            const {message} = await response.json();

            //get response message...
            console.log(message)

            //Refresh students data...
            await handleGetAll()
        }
        catch(err) {
            console.log('Error:', err);
        }

        setIsloading(false)
        setIsOpenEdit(false)
        setForm(initialForm)
    }

    const handleDelete = async () => {
        const confirm = window.confirm(`Apakah anda yakin ingin menghapus ${form.name}?`)

        if(!confirm) return;

        const requestOptions = {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'}
        };
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${form.id}`, requestOptions)
        const {message} = await response.json();

        //get response message...
        console.log(message)

        //Refresh students data...
        await handleGetAll()

        setIsOpenEdit(false)
        setForm(initialForm)


    }

    useEffect(() => {
        //Get students data when DOM ready
        handleGetAll()
    }, [])

    return (
        <main className={`${inter.className} max-w-full md:max-w-4xl mx-auto px-[20px] py-[40px]`}>
            <div className="text-[55px] font-[800]">Next - Student Crud</div>
            {/*{Next code here...}*/}

            <div className="flex items-center justify-start py-[20px] w-[50%] gap-[10px]">
                <Input 
                    placeholder="Cari..."
                    onChange={(e) => setSearchField(e.target.value)}
                />
                <Button 
                    label="+ Tambah" 
                    color="primary" 
                    onClick={handleShowAdd}
                />
            </div>

            {!isLoading ?
                <>
                    {students.length > 0 ?
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
                            {students.filter(student => {
                                if (searchField == '') {
                                    return student
                                }
                                else if (student.name?.toLowerCase().includes(searchField.toLowerCase())) {
                                    return student
                                }
                            }).map((student, index) => 
                                <StudentItem 
                                    key={index}
                                    data={student}
                                    handleShowDetails={handleShowDetails}
                                />
                            )}
                        </div> :
                        <div>Student data empty...</div>
                    }
                </> :
                <div>Loading...</div>
            }

            {/*Tambahkan FormAdd di sini*/}
            {isOpenAdd &&
                <FormAdd 
                    form={form} 
                    isLoading={isLoading}
                    handleChange={handleChange}
                    handleAddNew={handleAddNew}
                    handleClose={() => setIsOpenAdd(false)}
                />
            }

            {isOpenEdit &&
                <FormEdit 
                    form={form} 
                    isLoading={isLoading}
                    handleChange={handleChange}
                    handleSave={handleSave}
                    handleDelete={handleDelete}
                    handleClose={() => setIsOpenEdit(false)}
                />
            }
        </main>
    )
}
