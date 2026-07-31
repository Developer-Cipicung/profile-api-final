-- SEED DATA FOR ADMIN
INSERT INTO admins (username, role, password_hash, full_name) 
VALUES ('[superadmin]', 'SUPER_ADMIN', '[superadminpasswordhash]', 'Super Administrator')
ON CONFLICT (username) DO NOTHING;

-- SEED DATA FOR NEWS
INSERT INTO news (title, content, thumbnail_url) VALUES
('Gotong Royong Membersihkan Jalan Desa', 'Seluruh warga Desa Cipicung berkumpul pagi ini untuk melaksanakan kegiatan gotong royong membersihkan jalan utama desa. Kegiatan ini rutin dilakukan setiap bulan untuk menjaga kebersihan dan kenyamanan bersama.', NULL),
('Festival Budaya Desa Tahunan', 'Desa Cipicung akan mengadakan Festival Budaya yang menampilkan berbagai kesenian tradisional, pameran UMKM, dan lomba rakyat. Acara ini terbuka untuk umum dan diharapkan dapat menarik wisatawan lokal.', NULL),
('Panen Raya Padi Berkualitas', 'Musim panen raya telah tiba. Para petani Desa Cipicung merayakan hasil panen padi yang melimpah tahun ini berkat sistem irigasi baru yang diresmikan bulan lalu.', NULL),
('Kegiatan Posyandu Balita dan Lansia', 'Kader kesehatan desa menyelenggarakan kegiatan Posyandu rutin. Selain pemeriksaan kesehatan balita, bulan ini juga diadakan penyuluhan gizi bagi lansia di balai desa.', NULL),
('Musyawarah Perencanaan Pembangunan Desa', 'Telah dilaksanakan Musdes (Musyawarah Desa) untuk membahas rencana pembangunan infrastruktur desa untuk tahun depan. Partisipasi masyarakat sangat antusias dalam memberikan usulan.', NULL),
('Pembagian Bantuan Sosial Sembako', 'Pemerintah desa membagikan bantuan sosial berupa paket sembako kepada 100 keluarga kurang mampu. Bantuan ini diharapkan dapat meringankan beban ekonomi warga menjelang hari raya.', NULL),
('Persiapan Perayaan Hari Kemerdekaan', 'Menyambut HUT RI, para pemuda karang taruna mulai sibuk menghias gapura dan merencanakan berbagai perlombaan 17-an yang meriah untuk seluruh warga.', NULL),
('Pelatihan Digitalisasi Program UMKM', 'Sebanyak 30 pelaku UMKM di Desa Cipicung mengikuti pelatihan pemasaran digital. Pelatihan ini bertujuan untuk meningkatkan omzet penjualan melalui platform media sosial dan e-commerce.', NULL);

-- SEED DATA FOR PRODUCTS
INSERT INTO products (name, description, price, image_url) VALUES
('Keripik Singkong Balado', 'Keripik singkong renyah dengan bumbu balado pedas manis khas buatan ibu-ibu PKK Desa Cipicung.', 15000, NULL),
('Gula Aren Asli', 'Gula aren organik cetak murni tanpa bahan pengawet. Cocok untuk campuran kopi atau bahan kue tradisional.', 25000, NULL),
('Kopi Bubuk Robusta Lokal', 'Kopi robusta hasil panen petani lokal yang disangrai secara tradisional untuk menghasilkan aroma yang khas.', 35000, NULL),
('Beras Organik Premium', 'Beras putih pulen hasil tanam organik tanpa pestisida kimia. Kemasan praktis 5 kilogram.', 75000, NULL),
('Madu Hutan Asli', 'Madu murni yang diambil langsung dari hutan sekitar desa. Dipercaya dapat meningkatkan daya tahan tubuh.', 85000, NULL),
('Kerajinan Anyaman Bambu', 'Tempat penyimpanan serbaguna yang dianyam rapi oleh pengrajin bambu berpengalaman di desa kami.', 45000, NULL),
('Opak Singkong Renyah', 'Camilan opak singkong gurih dengan rasa original. Sangat pas untuk teman minum teh di sore hari.', 12000, NULL),
('Peyek Kacang Tanah', 'Peyek kacang yang gurih dan renyah. Digoreng dengan minyak berkualitas sehingga tidak mudah tengik.', 18000, NULL),
('Sambal Bawang Kemasan', 'Sambal bawang super pedas buatan rumahan. Dikemas dalam botol higienis agar tahan lama.', 22000, NULL),
('Kerupuk Ikan Tenggiri', 'Kerupuk ikan tenggiri asli yang mekar sempurna saat digoreng. Rasanya gurih dan aroma ikannya terasa.', 20000, NULL),
('Batik Tulis Motif Lokal', 'Kain batik tulis dengan motif khas flora dan fauna sekitar Desa Cipicung. Pewarna alami dan awet.', 150000, NULL),
('Tas Anyaman Rotan', 'Tas selempang cantik yang terbuat dari anyaman rotan berkualitas. Cocok untuk jalan-jalan santai.', 65000, NULL);
