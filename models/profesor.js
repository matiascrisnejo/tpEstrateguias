'use strict';
module.exports = (sequelize, DataTypes) => {
  const profesor = sequelize.define('profesor', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    email: DataTypes.STRING,
    id_materia: DataTypes.INTEGER
  }, {});

  profesor.associate = function(models) {

    //asociacion a materia (pertenece a:)
  	profesor.belongsTo(models.materia
    ,{
      as : 'Materia-Relacionada',  
      foreignKey: 'id_materia'     
    })

  };

  return profesor;
};