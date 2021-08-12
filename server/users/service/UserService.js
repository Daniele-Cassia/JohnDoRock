const bcrypt = require('bcrypt');
const { QueryTypes } = require('sequelize');
const User = require('../model/User');
const Aluno = require('../../user_aluno/model/Aluno');
const Professor = require('../../user_professor/model/Professor');
const PermissionError = require('../../errors/PermissionError');
const QueryError = require('../../errors/QueryError');
const sequelize = require('../../database/index');

class UserService {
  async createUser(user) {
    const saltRounds = 10;
    user.senha = await bcrypt.hash(user.senha, saltRounds);
    const createdUser = await User.create(user);
    if(createdUser.cargo == "aluno"){
      const aluno = {
        instrumento: user.instrumento,
        UserId: createdUser.id,
      };
      await Aluno.create(aluno);
    }
    else if(createdUser.cargo == "professor"){
      const professor = {
        instrumento: user.instrumento,
        UserId: createdUser.id,
      };
      await Professor.create(professor);
    }
  }

  async getAllUsers() {
    return await User.findAll({
      raw: true,
      attributes:
    {
      exclude:
        ['senha', 'createdAt', 'updatedAt'],
    },
    });
  }

  async getUserById(iduser) {
    const user = await User.findByPk(iduser, {
      raw: true,
      attributes:
      {
        exclude:
          ['senha', 'createdAt', 'updatedAt'],
      },
      });
      if(!user){
        throw new QueryError(`Não foi encontrado um usuário com o ID: ${iduser}`);
      }
      if(user.cargo == 'professor') {
        const userEncontrado = await sequelize.query(
          'SELECT * FROM users as u INNER JOIN professors as p ON u.id = p.UserId WHERE u.id = :id_search',
          {
            replacements: { id_search: iduser },
            type: QueryTypes.SELECT,
          }
        );
      return userEncontrado;
    }
  }

  async getProfessores() {
    return await sequelize.query(
      "SELECT * FROM users AS u INNER JOIN professors AS p ON u.id = p.UserId",
      {
        type: QueryTypes.SELECT,
      }
    );
  }

  async getAlunosProfessor(idprofessor) {
    const professor = await sequelize.query(
      "SELECT p.id FROM professors as p INNER JOIN users as u ON p.UserId = u.id WHERE u.id = :id_professor",
      {
        replacements: { id_professor: idprofessor },
        type: QueryTypes.SELECT,
      }
      );
    return await sequelize.query(
      "SELECT u.name, a.instrumento FROM alunos AS a INNER JOIN professors AS p ON a.ProfessorId = p.id INNER JOIN users AS u ON a.UserId = u.id WHERE a.ProfessorId = :id_search",
      {
        replacements: { id_search: professor[0].id},
        type: QueryTypes.SELECT,
      }
    );
  }

  async getUltimosAlunos() {
    return await User.findAll({
      raw: true,
      where: {
        cargo: 'aluno',
      },
      limit: 5,
      order: [
        ['id', 'DESC'],
      ],
      attributes: {
      exclude:
        ['senha', 'createdAt', 'updatedAt'],
    },
    });
  }
  
  async updateUser(id, reqUserId, reqUserRole, body) {
    const user = await User.findByPk(id);
    if(!user){
      throw new QueryError(`Não foi encontrado um usuário com o ID: ${id}`);
    }
    const isAdmin = reqUserRole === 'admin';
    const isUpdateUser = reqUserId == id;
    if (isAdmin || isUpdateUser) {
      if (!isAdmin && body.cargo) {
        throw new PermissionError(
          'Você não tem permissão para atualizar seu papel');
      }
      // console.log(body);
      if(body.instrumento && user.cargo == 'professor'){
        await sequelize.query(
          "UPDATE users as u INNER JOIN professors as p ON u.id = p.UserId SET u.name = ':nameUser', p.instrumento = ':instrumentoUser' WHERE u.id = :idUser",
          {
            type: QueryTypes.SELECT,
            replacements: { 
              idUser: id,
              nameUser: user.nameUser,
              instrumentoUser: body.instrumento
            },
          }
        );
      }
      else if(!body.instrumento && user.cargo == 'professor'){
        await sequelize.query(
          "UPDATE users as u INNER JOIN professors as p ON u.id = p.UserId SET u.name = ':nameUser' WHERE u.id = :iduser",
          {
            type: QueryTypes.SELECT,
            replacements: { 
              idUser: id,
              nameUser: user.nameUser,
            },
          }
        );
      }
      else if(body.instrumento && user.cargo == 'aluno'){
        await sequelize.query(
          "UPDATE users as u INNER JOIN alunos as a ON u.id = a.UserId SET u.name = ':nameUser', a.instrumento = ':instrumentoUser' WHERE u.id = :iduser",
          {
            type: QueryTypes.SELECT,
            replacements: { 
              idUser: id,
              nameUser: user.nameUser,
              instrumentoUser: body.instrumento
            },
          }
        );
      }
      else if(!body.instrumento && user.cargo == 'aluno'){
        await sequelize.query(
          "UPDATE users as u INNER JOIN alunos as a ON u.id = a.UserId SET u.name = 'jao', a.instrumento = 'bateria' WHERE u.id = :iduser",
          {
            type: QueryTypes.SELECT,
            replacements: { 
              idUser: id,
              nameUser: user.nameUser,
            },
          }
        );
      }
    } else {
      throw new PermissionError(
        'Você não tem permissão para atualizar esse usuário');
    }
  }

  async deleteUser(id, reqUserId) {
    const user = await User.findByPk(id);
    if(!user){
      throw new QueryError(`Não foi encontrado um usuário com o ID: ${id}`);
    }
    if (id == reqUserId) {
      throw new PermissionError(
        'Você não pode se deletar!');
    }
    await user.destroy();
  }

  async getCurrentUser(id) {
    const user = await User.findByPk(id,
      {
        attributes: { 
          exclude:
        ['senha', 'createdAt', 'updatedAt'],
        },
      });
      if(!user) {
        throw new QueryError(`Não foi encontrado um usuário com o ID: ${id}`);
      }
      return user;
  }
}

module.exports = new UserService();
