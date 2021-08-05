import { useState } from 'react';
import './FormCadastro.css';
import { useHistory } from 'react-router-dom';
import Logo from '../../../assets/john_do_rock_cortada.png';
import axios from 'axios';
import { Row, Col, Button, Form} from 'react-bootstrap';

export default function FormCadastro() {

  const history = useHistory();

  const [formValues, setFormValues] = useState({
    name: '',
    senha: '',
    cargo: '',
    email: '',
    data_nasc: '',
    instrumento: ''
  });

  const inputChange = (event) => {
    if(event.target.name === "name")
      setFormValues({...formValues, name: event.target.value})

    if(event.target.name === "senha")
      setFormValues({...formValues, senha: event.target.value})
    
    if(event.target.name === "cargo")
      setFormValues({...formValues, cargo: event.target.value})
    
    if(event.target.name === "email")
      setFormValues({...formValues, email: event.target.value})
    
    if(event.target.name === "instrumento")
      setFormValues({...formValues, instrumento: event.target.value})
      
    if(event.target.name === "data_nasc")
      setFormValues({...formValues, data_nasc: event.target.value})
    console.log(formValues)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post('/users', formValues)
      .then( (res) => console.log(res) )
        // if(formValues.cargo === 'aluno'){
        //   axios.post('/users/aluno', formValues).then().catch((err) => console.log(err.response))
        // }
        // else if(formValues.cargo === 'professor'){
        //   axios.post('/users/professor', formValues).then().catch((err) => console.log(err.response))
        // }
      .catch( (err) => console.log(err.response) )

    
  }

  // const [email, setEmail] = useState('');
  // const [senha, setSenha] = useState('');
  // const [cargo, setCargo] = useState('');
  // const [data_nasc, setDataNasc] = useState('');
  // const [nome, setNome] = useState('');
  // const [instrumento, setInstrumento] = useState('');

  // function handleEmailChange(event) {
  //   setEmail(event.target.value);
  // }

  // function handlePasswordChange(event) {
  //   setSenha(event.target.value);
  // }

  // function handleCargoChange(event) {
  //   setCargo(event.target.value);
  // }

  // function handleDataNascChange(event) {
  //   setDataNasc(event.target.value);
  // }

  // function handleNomeChange(event) {
  //   setNome(event.target.value);
  // }

  // function handleInstrumentoChange(event) {
  //   setInstrumento(event.target.value);
  // }

  // function handleSubmit(event) {
  //   event.preventDefault();
  //   axios.post('/users', { email, senha }).then((res) => history.push('/home'))
  //     .catch((err) => alert(err));
  // }

  return (
    <div className="FormCadastro">
      <Form onSubmit={handleSubmit} method="POST">
        <div className="containerCadastro">
          <img src={Logo}
            alt="logo"
            width="50%"
            height="50%"
            padding="0" 
          />
          <br />

          <div className="FormularioCadastro">
            <div id="Nome">
              <input type="text" placeholder="Digite seu nome" name="name"
                required onChange={inputChange} />
            </div>

            <div id="EmailCadastro">
              <input type="text" placeholder="Digite seu email" name="email"
                required onChange={inputChange} />
            </div>

            <div id="Instrumento">
              <input type="text" placeholder="Digite o instrumento" name="instrumento"
                required onChange={inputChange}/>
            </div> 

            <div id="Senha">
              <input id="form-bottom" type="password" placeholder="Digite sua senha" name="senha"
                required onChange={inputChange}/>
            </div>

            <Row>
              <Col>
                Data de Nascimento
                <div id="DataNascimento">
                  <input type="date" placeholder="Digite sua data de nascimento" name="data_nasc"
                    required onChange={inputChange}/>
                </div>
              
              </Col>
              <Col>
                <div id="Cargo">
                  Usuário
                  <select name="cargo" className="me-sm-2" id="inlineFormCustomSelect" onChange={inputChange} placeholder>
                    {/* <option value="">Cargo</option> */}
                    <option value="aluno">Aluno</option>
                    <option value="professor">Professor</option>
                  </select>
                </div>
              </Col>
            </Row>

          </div>

          <Button variant="warning" type="submit">Cadastrar</Button>

          <br className="unselectable" />
          <br className="unselectable" />

        </div>
      </Form>
    </div>
  )
}