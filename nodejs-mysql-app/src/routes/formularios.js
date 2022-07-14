const express = require('express');
const { route } = require('express/lib/application');
const router = express.Router();
const pool= require('../database');
const { isLoggedIn } = require('../lib/auth');
const pdf = require('../pdf');

router.get('/add',isLoggedIn, (req, res) => {
    res.render('formularios/add');
});

router.post('/add',isLoggedIn,async  (req, res) => {
    const {Nombredelproyecto,fechainicio,fechatermino,radio,metrica1,metrica2,metrica3,menu,checkbox,descripcion} = req.body;
    const NewFormulario = {
        Nombredelproyecto,
        fechainicio,
        fechatermino,
        radio,
        metrica1,
        metrica2,
        metrica3,
        menu,
        checkbox,
        descripcion,
        users_id: req.user.id 
    };
    await pool.query('INSERT INTO formularios set ?',[NewFormulario]);
    req.flash('Aceptado','Plan guardado de exitosamente');
    res.redirect('/formularios');
});

router.get('/',isLoggedIn, async (req, res) => {
    const formularios = await pool.query('SELECT *FROM formularios WHERE users_id = ?',[req.user.id]);
    res.render('formularios/list',{formularios:formularios});
});


router.get('/delete/:id',isLoggedIn, async (req, res)=> {
    const {id}= req.params;
    await pool.query('DELETE FROM formularios WHERE ID = ?',[id]);
    req.flash('Aceptado','Plan eliminado satisfactoriamente');
    res.redirect('/formularios');
});

router.get('/edit/:id',isLoggedIn, async (req, res)=> {
    const {id}= req.params;
    const formularios = await pool.query('SELECT * FROM formularios WHERE id = ?',[id]);
    req.flash('Aceptado','Plan editado satisfactoriamente');
    res.render('formularios/edit',{formulario: formularios[0]});
});

router.post('/edit/:id',isLoggedIn, async(req, res)=> {
    const {id} = req.params;
    const {Nombredelproyecto,fechainicio,fechatermino,radio,metrica1,metrica2,metrica3,menu,checkbox,descripcion} = req.body;
    const NewFormulario = {
        Nombredelproyecto,
        fechainicio,
        fechatermino,
        radio,
        metrica1,
        metrica2,
        metrica3,
        menu,
        checkbox,
        descripcion,
        users_id: req.user.id
    };
    await pool.query('UPDATE formularios set ? WHERE id= ?',[NewFormulario, id]);
    req.flash('Aceptado','Plan editado satisfactoriamente');
    res.redirect('/formularios');
});

router.get('/download/:id',isLoggedIn, async (req, res)=> {
    const {id} = req.params;
    const formularios = await pool.query('SELECT * FROM formularios WHERE id = ?',[id]);
    /* console.log(formularios,"log1")
    console.log(Object.values(formularios[0])[1],"log3")
    console.log(typeof Object.values(formularios[0])[1],"log4")
    console.log(typeof formularios[0].Nombredelproyecto, "log5") */
    const content = formularios[0].Nombredelproyecto+"\n"+formularios[0].fechainicio+"\n"+formularios[0].fechatermino+"\n"+formularios[0].metrica1+"\n"+formularios[0].metrica2+"\n"+formularios[0].metrica3+"\n"+formularios[0].descripcion;
    const stream = res.writeHead(200,{
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=informe.pdf'  
    });
    
    pdf.buildPDF(
        (chunck) => stream.write(chunck),
        content,
        () => stream.end()
        
    );
    
});



module.exports = router;
