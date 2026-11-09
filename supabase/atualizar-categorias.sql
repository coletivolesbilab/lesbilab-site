-- Atualiza as categorias do site (29 categorias, sem "Outros"). Pode rodar mais de uma vez.
update categorias set nome = 'Artes Visuais, Design & Artesanato', slug = 'artes-visuais-design-artesanato' where slug = 'artes-visuais';

insert into categorias (nome, slug, ordem) values
('Administração, Finanças & Negócios','administracao-financas-negocios',1),
('Arquitetura, Engenharia & Obras','arquitetura-engenharia-obras',2),
('Artes Visuais, Design & Artesanato','artes-visuais-design-artesanato',3),
('Audiovisual','audiovisual',4),
('Bares','bares',5),
('Bartender','bartender',6),
('Bem-estar & Cuidado','bem-estar-cuidado',7),
('Ciências & Meio Ambiente','ciencias-meio-ambiente',8),
('Comidinhas & bebidinhas','comidinhas-bebidinhas',9),
('Comunicação & Conteúdo','comunicacao-conteudo',10),
('Direito & Jurídico','direito-juridico',11),
('Educação & Facilitação','educacao-facilitacao',12),
('Empreendedorismo & Marcas Independentes','empreendedorismo-marcas',13),
('Escrita & Pesquisa','escrita-pesquisa',14),
('Espiritualidade & Terapias Holísticas','espiritualidade-terapias-holisticas',15),
('Esporte & Atividade Física','esporte-atividade-fisica',16),
('Estética & Beleza','estetica-beleza',17),
('Fotografia','fotografia',18),
('Manutenção, Reparos & Serviços','manutencao-reparos-servicos',19),
('Moda & Estilo','moda-estilo',20),
('Música','musica',21),
('Performance & Artes Cênicas','performance-artes-cenicas',22),
('Pets & Animais','pets-animais',23),
('Política','politica',24),
('Produção Cultural & Eventos','producao-cultural-eventos',25),
('Saúde','saude',26),
('Saúde mental','saude-mental',27),
('Serviço Social','servico-social',28),
('Tecnologia & Digital','tecnologia-digital',29)
on conflict (slug) do update set nome = excluded.nome, ordem = excluded.ordem;

-- Quem estava em "Outros" fica marcado para revisão; "Outros" sai da lista
update profissionais set revisar = true
where id in (select pc.profissional_id from profissional_categorias pc join categorias c on c.id = pc.categoria_id where c.slug = 'outros');
delete from categorias where slug = 'outros';

-- Bartenders saem de "Bares" e vão para "Bartender"
insert into profissional_categorias (profissional_id, categoria_id)
select p.id, (select id from categorias where slug = 'bartender') from profissionais p
where unaccent(lower(p.profissao)) ~ '(bartender|barman|barwoman|barista|mixolog|coquetel|drinks)'
on conflict do nothing;
delete from profissional_categorias
where categoria_id = (select id from categorias where slug = 'bares')
  and profissional_id in (select id from profissionais where unaccent(lower(profissao)) ~ '(bartender|barman|barwoman|barista|mixolog|coquetel|drinks)');
