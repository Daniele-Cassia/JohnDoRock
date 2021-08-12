const router = require('express').Router();
const UserService = require('../service/UserService');

const {
  jwtMiddleware,
  notLoogedIn,
  loginMiddleware,
  checkRole,
} = require('../../middlewares/auth-middlewares');
const objectFilter = require('../../middlewares/object-filter');
const userValidate = require('../../middlewares/user-validator');

router.post('/',
  objectFilter('body', ['name', 'email', 'data_nasc', 'senha', 'cargo', 'instrumento']),
  userValidate('createUser'),
  async (req, res, next) => {
    try {
      const user = {
        name: req.body.name,
        email: req.body.email,
        senha: req.body.senha,
        data_nasc: req.body.data_nasc,
        cargo: req.body.cargo,
        instrumento: req.body.instrumento,
      };

      await UserService.createUser(user);
      res.status(201).end();
    } catch (error) {
      next(error);
    }
  });

router.get('/', jwtMiddleware, async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/user/:id', jwtMiddleware, async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await UserService.getUserById(userId);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/ultimosalunos', jwtMiddleware, async (req, res, next) => {
  try {
    const users = await UserService.getUltimosAlunos();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/professores', jwtMiddleware, async (req, res, next) => {
  try {
    const users = await UserService.getProfessores();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

router.put('/user/:id', jwtMiddleware,
  objectFilter('body', ['name', 'email']),
  userValidate('updateUser'),
  async (req, res, next) => {
    try {
      const userId = req.params.id;
      await UserService.updateUser(userId, req.user.id, req.user.cargo, req.body);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

// router.put('/user/:id', jwtMiddleware,
// objectFilter('body', ['name', 'email']),
// userValidate('updateUser'),
// async (req, res, next) => {
//   try {
//     const userId = req.params.id;
//     
//     if(user.cargo === "aluno"){
//       const aluno = Aluno.findByPk(userId);
// 
//       const newAlunoData = {
//         instrumento:req.instrumento,
//       }
//       aluno.update(newAlunoData);
//     }
//     if(user.cargo === "professor"){
//       const professor = Professor.findByPk(userId);
// 
//       const newProfessorData = {
//         instrumento:req.instrumento,
//       }
//       professor.update(newProfessorData);
//     }
//     await UserService.updateUser(userId, req.user.id, req.user.cargo, req.body);
//     res.status(204).end();
//   } catch (error) {
//     next(error);
//   }
// });

router.delete('/user/:id', jwtMiddleware, checkRole('admin'), async (req, res, next) => {
  try {
    const userId = req.params.id;
    await UserService.deleteUser(userId, req.user.id);

    res.status(204).end();
  } catch (error) {
    next(error);
    // console.log('erro ta aqui');
  }
});

router.post('/login', notLoogedIn, userValidate('login'), loginMiddleware);

router.get('/logout', jwtMiddleware, async (req, res, next) => {
  try {
    res.clearCookie('jwt');
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get('/me', jwtMiddleware, async (req, res, next) => {
  try {
    const user = await UserService.getCurrentUser(req.user.id);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
