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
        'SELECT * FROM Users as u INNER JOIN Professors as p ON u.id = p.UserId WHERE u.id = :id_search',
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
      "SELECT * FROM Users AS u INNER JOIN Professors AS p ON u.id = p.UserId",
      {
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
      await user.update(body);
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
