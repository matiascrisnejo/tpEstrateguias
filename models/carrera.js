'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING,
    id_facultad: DataTypes.INTEGER
  }, {});
  carrera.associate = function(models) {
  	carrera.hasMany(models.materia,  
    {
      as: 'materia',                 
      foreignKey: 'id_carrera'        
    })

    carrera.belongsTo(models.facultad,  
    {
      as: 'Facultad-Relacionada',                
      foreignKey: 'id_facultad'       
    })

  };
  return carrera;
};