--
-- PostgreSQL database dump
--

\restrict TuqW9t4nZUrC33DLYlIflsiRu5vZ4WrPbhw9fSbzVrq3FpAJbk9YMz2L5lkinUB

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    entity_type character varying(50),
    entity_id integer,
    details jsonb,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: otp_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_codes (
    id integer NOT NULL,
    user_id integer,
    code character varying(6) NOT NULL,
    type character varying(20) DEFAULT 'email'::character varying,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT otp_codes_type_check CHECK (((type)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying])::text[])))
);


--
-- Name: otp_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.otp_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: otp_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.otp_codes_id_seq OWNED BY public.otp_codes.id;


--
-- Name: project_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_media (
    id integer NOT NULL,
    project_id integer,
    media_type character varying(50) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer,
    configuration character varying(50),
    description character varying(255),
    is_visible boolean DEFAULT true,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT project_media_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['floor_plan'::character varying, 'video'::character varying, 'brochure'::character varying, 'image'::character varying, 'pdf'::character varying])::text[])))
);


--
-- Name: project_media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_media_id_seq OWNED BY public.project_media.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    project_name character varying(255) NOT NULL,
    developer_name character varying(255),
    location character varying(255),
    plot_size character varying(255),
    total_towers integer,
    total_floors integer,
    possession character varying(255),
    budget_min numeric(15,2),
    budget_max numeric(15,2),
    carpet_area_min integer,
    carpet_area_max integer,
    configurations text[],
    rate_psf_min numeric(15,2),
    rate_psf_max numeric(15,2),
    availability_status character varying(100) DEFAULT 'Ready'::character varying,
    notes text,
    client_requirement_tags text[],
    google_maps_link text,
    is_visible boolean DEFAULT true,
    visibility_settings jsonb DEFAULT '{}'::jsonb,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    attribute_1 character varying(255),
    attribute_2 character varying(255),
    attribute_3 character varying(255),
    attribute_4 character varying(255),
    attribute_5 character varying(255),
    attribute_6 character varying(255),
    attribute_7 character varying(255),
    attribute_8 character varying(255),
    attribute_9 character varying(255),
    attribute_10 character varying(255),
    attribute_11 character varying(255),
    attribute_12 character varying(255),
    attribute_13 character varying(255)
);


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    two_factor_enabled boolean DEFAULT false,
    two_factor_secret character varying(255),
    is_visible boolean DEFAULT true,
    visible_attributes jsonb DEFAULT '{"1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": true, "8": true, "9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: otp_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes ALTER COLUMN id SET DEFAULT nextval('public.otp_codes_id_seq'::regclass);


--
-- Name: project_media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_media ALTER COLUMN id SET DEFAULT nextval('public.project_media_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) FROM stdin;
1	1	bulk_delete	projects	\N	{"project_ids": [120, 119], "deleted_count": 2}	\N	2026-01-08 10:41:11.914167
2	1	bulk_delete	projects	\N	{"project_ids": [118, 116, 111, 109, 112, 115, 114, 113, 117], "deleted_count": 9}	\N	2026-01-08 10:52:11.909961
\.


--
-- Data for Name: otp_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.otp_codes (id, user_id, code, type, expires_at, used, created_at) FROM stdin;
\.


--
-- Data for Name: project_media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_media (id, project_id, media_type, file_name, file_path, file_size, configuration, description, is_visible, uploaded_by, created_at) FROM stdin;
4	100	floor_plan	Software_Development_Requirements__hUcPt2Q (1) (1).pdf	850ed38c-104e-43d4-af7d-adeefd424504-Software_Development_Requirements__hUcPt2Q (1) (1).pdf	54013	\N	\N	t	1	2026-01-08 10:13:45.855434
5	100	video	Video-953 (1).mp4	1ab916af-9c7d-47aa-9542-af6003cdedf9-Video-953 (1).mp4	21401384	\N	\N	t	1	2026-01-08 10:14:00.054664
6	99	video	Video-658.mp4	e4b5f9c7-56ba-4d6e-ade5-80a0749766cc-Video-658.mp4	23854852	\N	\N	t	1	2026-01-08 10:22:45.033445
7	99	floor_plan	AMAN KAUSHAL.pdf	ebf2c6b3-4618-4478-b259-55b523422667-AMAN KAUSHAL.pdf	135801	\N	\N	t	1	2026-01-08 10:23:03.181507
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, project_name, developer_name, location, plot_size, total_towers, total_floors, possession, budget_min, budget_max, carpet_area_min, carpet_area_max, configurations, rate_psf_min, rate_psf_max, availability_status, notes, client_requirement_tags, google_maps_link, is_visible, visibility_settings, created_by, created_at, updated_at, attribute_1, attribute_2, attribute_3, attribute_4, attribute_5, attribute_6, attribute_7, attribute_8, attribute_9, attribute_10, attribute_11, attribute_12, attribute_13) FROM stdin;
101	Palazzo Mahalaxmi	Godrej Properties	Mahalaxmi, South Mumbai	1.7 acres	4	52	Dec 2024	140000000.00	340000000.00	1865	3276	{"2 BHK","3 BHK","4 BHK","5 BHK"}	74198.00	102597.00	Ready to Move	Godrej Properties presents a luxurious development in the heart of Mahalaxmi. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Landscaped podium garden with jogging track. Dedicated parking with EV charging points. World-class amenities including infinity pool, spa, and gymnasium. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Ultra Luxury","Sea View"}	https://maps.google.com/?q=Mahalaxmi%2C%20Mumbai	t	{}	1	2026-01-08 10:26:15.156166	2026-01-08 10:26:15.156166	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
102	Enclave Malabar Hill	Marathon Group	Malabar Hill, South Mumbai	5.5 acres	4	30	Jun 2025	70000000.00	240000000.00	883	1956	{"2 BHK","3 BHK","4 BHK","5 BHK"}	83937.00	124914.00	Pre-Launch	Marathon Group presents a luxurious development in the heart of Malabar Hill. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Stunning sea views from upper floors. Concierge services and 24x7 security. Perfect for discerning buyers seeking premium living in South Mumbai.	{Family,"Sea View","Ultra Luxury","City View",Premium}	https://maps.google.com/?q=Malabar%20Hill%2C%20Mumbai	t	{}	1	2026-01-08 10:26:15.164228	2026-01-08 10:26:15.164228	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
103	The Peninsula Colaba	Wadhwa Group	Colaba, South Mumbai	5.3 acres	4	29	Dec 2024	110000000.00	270000000.00	1443	2131	{"3 BHK","4 BHK","5 BHK"}	76843.00	128094.00	New Launch	Wadhwa Group presents a luxurious development in the heart of Colaba. Available in 3 BHK, 4 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Stunning sea views from upper floors. Concierge services and 24x7 security. Perfect for discerning buyers seeking premium living in South Mumbai.	{NRI,Heritage,Investment,"Ultra Luxury",Luxury}	https://maps.google.com/?q=Colaba%2C%20Mumbai	t	{}	1	2026-01-08 10:26:15.170092	2026-01-08 10:26:15.170092	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
104	Royal Residency Nariman Point	Rustomjee	Nariman Point, South Mumbai	3.4 acres	4	32	Dec 2027	70000000.00	190000000.00	1303	1855	{"2 BHK","3 BHK","5 BHK"}	54297.00	100816.00	Pre-Launch	Rustomjee presents a luxurious development in the heart of Nariman Point. Available in 2 BHK, 3 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Concierge services and 24x7 security. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{HNWI,Celebrity}	https://maps.google.com/?q=Nariman%20Point%2C%20Mumbai	t	{}	1	2026-01-08 10:26:15.174789	2026-01-08 10:26:15.174789	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
106	The Signature Marine Drive	Lodha Group	Marine Drive, South Mumbai	5.5 acres	2	34	Dec 2024	130000000.00	300000000.00	1705	2878	{"2 BHK","3 BHK","4 BHK","5 BHK"}	75870.00	103568.00	Ready to Move	Lodha Group presents a luxurious development in the heart of Marine Drive. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Smart home automation in all apartments. Concierge services and 24x7 security. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{NRI,"Pool View"}	https://maps.google.com/?q=Marine%20Drive%2C%20Mumbai	t	{}	1	2026-01-08 10:26:15.185844	2026-01-08 10:26:15.185844	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
107	One Cumballa Hill	SD Corp	Cumballa Hill, South Mumbai	5.6 acres	1	70	Mar 2026	80000000.00	210000000.00	1291	2706	{"2 BHK","3 BHK","4 BHK","5 BHK"}	63592.00	76307.00	Pre-Launch	SD Corp presents a luxurious development in the heart of Cumballa Hill. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Smart home automation in all apartments. Premium Italian marble flooring throughout. Concierge services and 24x7 security. Perfect for discerning buyers seeking premium living in South Mumbai.	{Penthouse,Luxury}	https://maps.google.com/?q=Cumballa%20Hill%2C%20Mumbai	t	{}	1	2026-01-08 10:26:15.191252	2026-01-08 10:26:15.191252	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
108	Infiniti Walkeshwar	Indiabulls Real Estate	Walkeshwar, South Mumbai	3.3 acres	4	35	Mar 2026	70000000.00	180000000.00	825	1538	{"2 BHK","3 BHK","4 BHK","5 BHK"}	80816.00	118028.00	Ready to Move	Indiabulls Real Estate presents a luxurious development in the heart of Walkeshwar. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Smart home automation in all apartments. Designer modular kitchen with imported fittings. Premium Italian marble flooring throughout. Perfect for discerning buyers seeking premium living in South Mumbai.	{Family,Heritage,Duplex,HNWI,Luxury}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-08 10:26:15.195933	2026-01-08 10:26:15.195933	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
105	Primero Worli	Hiranandani Group	Worli, South Mumbai	5.1 acres	1	41	Ready Possession	70000000.00	180000000.00	872	1827	{"2 BHK","3 BHK","4 BHK","5 BHK"}	80000.00	98524.00	New Launch	Hiranandani Group presents a luxurious development in the heart of Worli. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Concierge services and 24x7 security. Dedicated parking with EV charging points. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{Penthouse,"Ultra Luxury"}	https://maps.google.com/?q=Worli%2C%20Mumbai	t	{}	1	2026-01-08 10:26:15.179906	2026-01-09 07:47:24.764891	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
52	Sea View Heights Walkeshwar	Runwal Group	Walkeshwar, South Mumbai	3.4 acres	1	34	Mar 2026	110000000.00	370000000.00	1894	3663	{"3 BHK","4 BHK"}	60597.00	100422.00	Pre-Launch	Runwal Group presents a luxurious development in the heart of Walkeshwar. Available in 3 BHK, 4 BHK configurations. Premium Italian marble flooring throughout. Smart home automation in all apartments. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{Luxury,Heritage,Celebrity,Duplex,Boutique}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.596687	2026-01-06 16:34:05.596687	3 apartments	2 VRV enabled	217 apartments	9109 sq ft	13 ft	9th floor	OC Received	10:90	₹152/sq ft	2 Podium	₹16/sq ft	Simplex	Foundation
51	Primero Nariman Point	Godrej Properties	Nariman Point, South Mumbai	3.9 acres	4	61	Dec 2026	50000000.00	180000000.00	916	1718	{"2 BHK","3 BHK","4 BHK","5 BHK"}	57590.00	105019.00	New Launch	Godrej Properties presents a luxurious development in the heart of Nariman Point. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Dedicated parking with EV charging points. Stunning sea views from upper floors. Smart home automation in all apartments. Perfect for discerning buyers seeking premium living in South Mumbai.	{Family,Celebrity,"Sea View",Penthouse,Luxury}	https://maps.google.com/?q=Nariman%20Point%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.589919	2026-01-06 17:04:24.111945	69	3 Panoramic	70 apartments	6337 sq ft	10 ft	6th floor	IOD Approved	Construction Linked	₹115/sq ft	1 Basement	₹37/sq ft	Penthouse	Nearing Completion
53	Elysium Breach Candy	Runwal Group	Breach Candy, South Mumbai	2.7 acres	4	35	Jun 2025	110000000.00	270000000.00	1659	3010	{"2 BHK","3 BHK","4 BHK","5 BHK"}	66870.00	89718.00	Ready to Move	Runwal Group presents a luxurious development in the heart of Breach Candy. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Private lift lobby for each apartment. Private theater and business center. Premium Italian marble flooring throughout. Perfect for discerning buyers seeking premium living in South Mumbai.	{Garden,"Ultra Luxury"}	https://maps.google.com/?q=Breach%20Candy%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.602234	2026-01-06 16:34:05.602234	4 apartments	3 Service + Passenger	376 apartments	11984 sq ft	11 ft	11th floor	RERA Registered	Flexi Payment	₹130/sq ft	2 Stacked	₹18/sq ft	Duplex	Foundation
54	Marina Bay Kemps Corner	Piramal Realty	Kemps Corner, South Mumbai	4.8 acres	4	20	Mar 2026	150000000.00	250000000.00	1816	2397	{"2 BHK","3 BHK","4 BHK","5 BHK"}	81272.00	103345.00	Pre-Launch	Piramal Realty presents a luxurious development in the heart of Kemps Corner. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Private lift lobby for each apartment. Stunning sea views from upper floors. World-class amenities including infinity pool, spa, and gymnasium. Perfect for discerning buyers seeking premium living in South Mumbai.	{Luxury,"Pool View",Premium,Boutique,HNWI}	https://maps.google.com/?q=Kemps%20Corner%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.608221	2026-01-06 16:34:05.608221	2 apartments	6 Service + Passenger	164 apartments	3902 sq ft	10 ft	10th floor	RERA Registered	Flexi Payment	₹53/sq ft	1 Stacked	₹19/sq ft	Simplex	Nearing Completion
55	Grand Bay Fort	Piramal Realty	Fort, South Mumbai	1.9 acres	3	40	Jun 2026	90000000.00	270000000.00	1652	2690	{"2 BHK","3 BHK","4 BHK"}	52263.00	99351.00	Under Construction	Piramal Realty presents a luxurious development in the heart of Fort. Available in 2 BHK, 3 BHK, 4 BHK configurations. Smart home automation in all apartments. World-class amenities including infinity pool, spa, and gymnasium. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{Luxury,NRI,Investment,Premium}	https://maps.google.com/?q=Fort%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.613969	2026-01-06 16:34:05.613969	5 apartments	5 High-speed	306 apartments	12817 sq ft	13 ft	8th floor	RERA Registered	10:90	₹157/sq ft	2 Stacked	₹26/sq ft	Triplex	Foundation
56	The World Towers Cumballa Hill	Rustomjee	Cumballa Hill, South Mumbai	2.9 acres	3	60	Ready Possession	90000000.00	360000000.00	1247	3223	{"2 BHK","3 BHK","4 BHK","5 BHK"}	75977.00	112473.00	Ready to Move	Rustomjee presents a luxurious development in the heart of Cumballa Hill. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Private lift lobby for each apartment. Concierge services and 24x7 security. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{Penthouse,Luxury,Investment,NRI,Premium}	https://maps.google.com/?q=Cumballa%20Hill%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.619779	2026-01-06 16:34:05.619779	6 apartments	4 VRV enabled	167 apartments	6131 sq ft	14 ft	3th floor	IOD Approved	10:90	₹117/sq ft	1 Basement	₹33/sq ft	Duplex	Foundation
57	Primero Walkeshwar	Shapoorji Pallonji	Walkeshwar, South Mumbai	1.0 acres	3	45	Mar 2026	80000000.00	300000000.00	1334	2870	{"2 BHK","3 BHK","4 BHK"}	61184.00	105083.00	Ready to Move	Shapoorji Pallonji presents a luxurious development in the heart of Walkeshwar. Available in 2 BHK, 3 BHK, 4 BHK configurations. Stunning sea views from upper floors. Smart home automation in all apartments. World-class amenities including infinity pool, spa, and gymnasium. Perfect for discerning buyers seeking premium living in South Mumbai.	{Family,"City View",Duplex,"Sea View",NRI}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.62489	2026-01-06 16:34:05.62489	2 apartments	6 VRV enabled	299 apartments	3340 sq ft	12 ft	4th floor	RERA Registered	Construction Linked	₹55/sq ft	1 Stacked	₹43/sq ft	Triplex	Foundation
58	Infiniti Colaba	Lodha Group	Colaba, South Mumbai	5.8 acres	4	43	Ready Possession	90000000.00	240000000.00	1241	2082	{"2 BHK","3 BHK","4 BHK","5 BHK"}	73633.00	113654.00	Ready to Move	Lodha Group presents a luxurious development in the heart of Colaba. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Dedicated parking with EV charging points. Smart home automation in all apartments. Premium Italian marble flooring throughout. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Ultra Luxury",Penthouse}	https://maps.google.com/?q=Colaba%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.631512	2026-01-06 16:34:05.631512	3 apartments	6 High-speed	143 apartments	6557 sq ft	10 ft	7th floor	OC Received	20:80	₹170/sq ft	1 Mechanical	₹37/sq ft	Triplex	Podium Level
59	The Residences Walkeshwar	Kalpataru	Walkeshwar, South Mumbai	5.5 acres	3	24	Ready Possession	50000000.00	280000000.00	824	2687	{"2 BHK","3 BHK","4 BHK","5 BHK"}	56580.00	105334.00	New Launch	Kalpataru presents a luxurious development in the heart of Walkeshwar. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Stunning sea views from upper floors. Private theater and business center. Smart home automation in all apartments. Perfect for discerning buyers seeking premium living in South Mumbai.	{Penthouse,"Sea View",Garden}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.637447	2026-01-06 16:34:05.637447	3 apartments	3 Panoramic	219 apartments	13190 sq ft	11 ft	12th floor	RERA Registered	10:90	₹139/sq ft	3 Podium	₹40/sq ft	Duplex	Nearing Completion
60	Palazzo Kemps Corner	L&T Realty	Kemps Corner, South Mumbai	1.9 acres	4	40	Mar 2026	70000000.00	230000000.00	1232	2325	{"2 BHK","5 BHK"}	54604.00	97596.00	Ready to Move	L&T Realty presents a luxurious development in the heart of Kemps Corner. Available in 2 BHK, 5 BHK configurations. Stunning sea views from upper floors. Private lift lobby for each apartment. World-class amenities including infinity pool, spa, and gymnasium. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Pool View",Luxury,HNWI,"Ultra Luxury"}	https://maps.google.com/?q=Kemps%20Corner%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.64373	2026-01-06 16:34:05.64373	3 apartments	4 High-speed	383 apartments	13160 sq ft	14 ft	9th floor	OC Received	Construction Linked	₹106/sq ft	1 Basement	₹16/sq ft	Penthouse	Mid-rise
61	One Kemps Corner	Lodha Group	Kemps Corner, South Mumbai	1.6 acres	2	68	Mar 2025	90000000.00	190000000.00	1054	1870	{"2 BHK","3 BHK","4 BHK"}	85013.00	100911.00	Pre-Launch	Lodha Group presents a luxurious development in the heart of Kemps Corner. Available in 2 BHK, 3 BHK, 4 BHK configurations. Landscaped podium garden with jogging track. Dedicated parking with EV charging points. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{Heritage,"Sea View",NRI,Premium,Garden}	https://maps.google.com/?q=Kemps%20Corner%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.649185	2026-01-06 16:34:05.649185	4 apartments	4 VRV enabled	250 apartments	7293 sq ft	10 ft	9th floor	OC Received	10:90	₹72/sq ft	2 Basement	₹33/sq ft	Penthouse	Foundation
62	Tower Malabar Hill	Lodha Group	Malabar Hill, South Mumbai	2.1 acres	1	47	Dec 2026	100000000.00	410000000.00	1262	3074	{"2 BHK","5 BHK"}	76643.00	133857.00	Pre-Launch	Lodha Group presents a luxurious development in the heart of Malabar Hill. Available in 2 BHK, 5 BHK configurations. Smart home automation in all apartments. Stunning sea views from upper floors. Dedicated parking with EV charging points. Perfect for discerning buyers seeking premium living in South Mumbai.	{"City View",Premium,"Ultra Luxury"}	https://maps.google.com/?q=Malabar%20Hill%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.654282	2026-01-06 16:34:05.654282	2 apartments	3 VRV enabled	215 apartments	8411 sq ft	10 ft	7th floor	OC Received	20:80	₹108/sq ft	3 Mechanical	₹43/sq ft	Penthouse	Nearing Completion
63	Marina Bay Churchgate	Rustomjee	Churchgate, South Mumbai	2.5 acres	2	67	Dec 2024	50000000.00	240000000.00	803	2083	{"2 BHK","3 BHK","4 BHK","5 BHK"}	59111.00	112968.00	Pre-Launch	Rustomjee presents a luxurious development in the heart of Churchgate. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Premium Italian marble flooring throughout. Stunning sea views from upper floors. Dedicated parking with EV charging points. Perfect for discerning buyers seeking premium living in South Mumbai.	{Penthouse,Luxury,"Pool View",Celebrity,"Ultra Luxury"}	https://maps.google.com/?q=Churchgate%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.659712	2026-01-06 16:34:05.659712	6 apartments	6 High-speed	51 apartments	5792 sq ft	13 ft	6th floor	IOD Approved	10:90	₹71/sq ft	3 Mechanical	₹44/sq ft	Penthouse	Nearing Completion
64	Sea View Heights Nepean Sea Road	L&T Realty	Nepean Sea Road, South Mumbai	4.1 acres	4	59	Jun 2026	100000000.00	220000000.00	1763	3244	{"2 BHK","3 BHK","4 BHK","5 BHK"}	56506.00	67898.00	New Launch	L&T Realty presents a luxurious development in the heart of Nepean Sea Road. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Dedicated parking with EV charging points. Private lift lobby for each apartment. Premium Italian marble flooring throughout. Perfect for discerning buyers seeking premium living in South Mumbai.	{Celebrity,"Pool View","Sea View",Expat,Premium}	https://maps.google.com/?q=Nepean%20Sea%20Road%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.665732	2026-01-06 16:34:05.665732	4 apartments	5 Panoramic	109 apartments	4759 sq ft	14 ft	10th floor	IOD Approved	Construction Linked	₹144/sq ft	1 Stacked	₹44/sq ft	Simplex	Podium Level
65	The World Towers Colaba	Hiranandani Group	Colaba, South Mumbai	1.2 acres	2	70	Jun 2026	60000000.00	200000000.00	914	2363	{"2 BHK","3 BHK"}	64163.00	85455.00	Ready to Move	Hiranandani Group presents a luxurious development in the heart of Colaba. Available in 2 BHK, 3 BHK configurations. Concierge services and 24x7 security. Smart home automation in all apartments. Premium Italian marble flooring throughout. Perfect for discerning buyers seeking premium living in South Mumbai.	{HNWI,"Ultra Luxury","High Floor",Luxury,Premium}	https://maps.google.com/?q=Colaba%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.6715	2026-01-06 16:34:05.6715	6 apartments	3 Service + Passenger	327 apartments	4158 sq ft	12 ft	12th floor	RERA Registered	Construction Linked	₹77/sq ft	2 Stacked	₹21/sq ft	Simplex	Foundation
66	Imperial Heights Fort	Lodha Group	Fort, South Mumbai	2.3 acres	3	28	Ready Possession	70000000.00	210000000.00	1172	2291	{"4 BHK","5 BHK"}	59960.00	93629.00	New Launch	Lodha Group presents a luxurious development in the heart of Fort. Available in 4 BHK, 5 BHK configurations. Private theater and business center. Designer modular kitchen with imported fittings. Concierge services and 24x7 security. Perfect for discerning buyers seeking premium living in South Mumbai.	{NRI,Penthouse,Luxury}	https://maps.google.com/?q=Fort%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.677217	2026-01-06 16:34:05.677217	2 apartments	4 High-speed	61 apartments	9251 sq ft	14 ft	3th floor	RERA Registered	Construction Linked	₹175/sq ft	3 Stacked	₹31/sq ft	Duplex	Foundation
67	The World Towers Colaba	Piramal Realty	Colaba, South Mumbai	4.7 acres	3	53	Jun 2025	90000000.00	240000000.00	1196	2875	{"3 BHK","5 BHK"}	72818.00	85060.00	Ready to Move	Piramal Realty presents a luxurious development in the heart of Colaba. Available in 3 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Stunning sea views from upper floors. Dedicated parking with EV charging points. Perfect for discerning buyers seeking premium living in South Mumbai.	{Penthouse,Expat,HNWI}	https://maps.google.com/?q=Colaba%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.683068	2026-01-06 16:34:05.683068	5 apartments	4 Service + Passenger	149 apartments	7476 sq ft	14 ft	7th floor	OC Received	Flexi Payment	₹133/sq ft	1 Mechanical	₹19/sq ft	Triplex	Podium Level
68	Sea Face Pedder Road	Lodha Group	Pedder Road, South Mumbai	2.4 acres	4	23	Jun 2026	140000000.00	360000000.00	1981	2829	{"2 BHK","3 BHK","4 BHK","5 BHK"}	69344.00	128434.00	Ready to Move	Lodha Group presents a luxurious development in the heart of Pedder Road. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Private lift lobby for each apartment. Smart home automation in all apartments. Designer modular kitchen with imported fittings. Perfect for discerning buyers seeking premium living in South Mumbai.	{"High Floor",Celebrity,Garden}	https://maps.google.com/?q=Pedder%20Road%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.688557	2026-01-06 16:34:05.688557	5 apartments	2 Panoramic	71 apartments	9474 sq ft	14 ft	6th floor	Commencement Certificate	20:80	₹118/sq ft	2 Mechanical	₹17/sq ft	Penthouse	Podium Level
69	Infiniti Colaba	Hiranandani Group	Colaba, South Mumbai	4.3 acres	2	21	Ready Possession	70000000.00	270000000.00	1137	3043	{"2 BHK","3 BHK"}	63297.00	87092.00	New Launch	Hiranandani Group presents a luxurious development in the heart of Colaba. Available in 2 BHK, 3 BHK configurations. Dedicated parking with EV charging points. Smart home automation in all apartments. Landscaped podium garden with jogging track. Perfect for discerning buyers seeking premium living in South Mumbai.	{Luxury,Boutique,NRI,"Ultra Luxury"}	https://maps.google.com/?q=Colaba%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.693434	2026-01-06 16:34:05.693434	5 apartments	6 VRV enabled	268 apartments	13035 sq ft	10 ft	5th floor	Commencement Certificate	10:90	₹77/sq ft	3 Basement	₹37/sq ft	Penthouse	Mid-rise
70	Altissimo Tardeo	Rustomjee	Tardeo, South Mumbai	5.9 acres	1	60	Mar 2027	150000000.00	440000000.00	1778	3657	{"2 BHK","3 BHK","4 BHK","5 BHK"}	86794.00	119428.00	Pre-Launch	Rustomjee presents a luxurious development in the heart of Tardeo. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Private theater and business center. Concierge services and 24x7 security. Designer modular kitchen with imported fittings. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Pool View",NRI,"Ultra Luxury",Expat}	https://maps.google.com/?q=Tardeo%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.698685	2026-01-06 16:34:05.698685	3 apartments	2 VRV enabled	314 apartments	4644 sq ft	10 ft	4th floor	OC Received	Flexi Payment	₹167/sq ft	1 Mechanical	₹32/sq ft	Penthouse	Nearing Completion
71	The World Towers Pedder Road	Shapoorji Pallonji	Pedder Road, South Mumbai	1.3 acres	1	54	Ready Possession	80000000.00	320000000.00	1278	2798	{"2 BHK","3 BHK","4 BHK","5 BHK"}	59334.00	113022.00	New Launch	Shapoorji Pallonji presents a luxurious development in the heart of Pedder Road. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Premium Italian marble flooring throughout. Dedicated parking with EV charging points. Smart home automation in all apartments. Perfect for discerning buyers seeking premium living in South Mumbai.	{Heritage,"Sea View","High Floor",HNWI}	https://maps.google.com/?q=Pedder%20Road%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.703959	2026-01-06 16:34:05.703959	2 apartments	4 High-speed	74 apartments	8027 sq ft	12 ft	7th floor	Commencement Certificate	10:90	₹142/sq ft	2 Basement	₹47/sq ft	Penthouse	Foundation
72	The Peninsula Worli	Oberoi Realty	Worli, South Mumbai	3.3 acres	3	57	Dec 2024	100000000.00	280000000.00	1925	3216	{"2 BHK","4 BHK"}	54515.00	87795.00	Pre-Launch	Oberoi Realty presents a luxurious development in the heart of Worli. Available in 2 BHK, 4 BHK configurations. Dedicated parking with EV charging points. Concierge services and 24x7 security. Designer modular kitchen with imported fittings. Perfect for discerning buyers seeking premium living in South Mumbai.	{"City View","Ultra Luxury",HNWI,Luxury,Boutique}	https://maps.google.com/?q=Worli%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.709198	2026-01-06 16:34:05.709198	3 apartments	5 High-speed	175 apartments	11008 sq ft	13 ft	5th floor	RERA Registered	30:70	₹50/sq ft	3 Mechanical	₹33/sq ft	Simplex	Ready
73	Sea View Heights Nariman Point	DB Realty	Nariman Point, South Mumbai	4.0 acres	1	23	Jun 2025	80000000.00	300000000.00	1329	3279	{"2 BHK","3 BHK"}	60643.00	92711.00	Under Construction	DB Realty presents a luxurious development in the heart of Nariman Point. Available in 2 BHK, 3 BHK configurations. Private theater and business center. Landscaped podium garden with jogging track. Designer modular kitchen with imported fittings. Perfect for discerning buyers seeking premium living in South Mumbai.	{HNWI,Family,"High Floor",Boutique}	https://maps.google.com/?q=Nariman%20Point%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.714638	2026-01-06 16:34:05.714638	3 apartments	5 VRV enabled	375 apartments	11036 sq ft	10 ft	7th floor	IOD Approved	10:90	₹191/sq ft	2 Stacked	₹41/sq ft	Simplex	Mid-rise
74	Ocean Crest Cumballa Hill	Omkar Realtors	Cumballa Hill, South Mumbai	3.7 acres	1	50	Jun 2025	130000000.00	280000000.00	1815	2377	{"2 BHK","3 BHK","4 BHK"}	71525.00	116642.00	Ready to Move	Omkar Realtors presents a luxurious development in the heart of Cumballa Hill. Available in 2 BHK, 3 BHK, 4 BHK configurations. Concierge services and 24x7 security. Stunning sea views from upper floors. Smart home automation in all apartments. Perfect for discerning buyers seeking premium living in South Mumbai.	{"High Floor",Heritage,Celebrity}	https://maps.google.com/?q=Cumballa%20Hill%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.719866	2026-01-06 16:34:05.719866	2 apartments	5 Panoramic	244 apartments	3710 sq ft	12 ft	10th floor	IOD Approved	Flexi Payment	₹100/sq ft	3 Mechanical	₹33/sq ft	Penthouse	Nearing Completion
75	Azure Marine Drive	Sheth Creators	Marine Drive, South Mumbai	2.7 acres	2	52	Mar 2025	140000000.00	390000000.00	1876	3511	{"2 BHK","3 BHK","4 BHK","5 BHK"}	74684.00	112288.00	Ready to Move	Sheth Creators presents a luxurious development in the heart of Marine Drive. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Dedicated parking with EV charging points. Premium Italian marble flooring throughout. Concierge services and 24x7 security. Perfect for discerning buyers seeking premium living in South Mumbai.	{Boutique,"Sea View"}	https://maps.google.com/?q=Marine%20Drive%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.724799	2026-01-06 16:34:05.724799	5 apartments	4 Service + Passenger	344 apartments	11706 sq ft	14 ft	5th floor	RERA Registered	Flexi Payment	₹95/sq ft	1 Mechanical	₹49/sq ft	Penthouse	Mid-rise
76	The Signature Colaba	DB Realty	Colaba, South Mumbai	4.2 acres	1	32	Dec 2025	110000000.00	290000000.00	1205	2269	{"4 BHK","5 BHK"}	89396.00	127443.00	Ready to Move	DB Realty presents a luxurious development in the heart of Colaba. Available in 4 BHK, 5 BHK configurations. Designer modular kitchen with imported fittings. Dedicated parking with EV charging points. Private lift lobby for each apartment. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Ultra Luxury",Boutique}	https://maps.google.com/?q=Colaba%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.729887	2026-01-06 16:34:05.729887	6 apartments	3 VRV enabled	274 apartments	4729 sq ft	10 ft	4th floor	RERA Registered	30:70	₹157/sq ft	2 Stacked	₹46/sq ft	Penthouse	Nearing Completion
77	Grand Bay Nepean Sea Road	DB Realty	Nepean Sea Road, South Mumbai	2.3 acres	3	46	Jun 2025	50000000.00	320000000.00	987	2953	{"2 BHK","3 BHK"}	53304.00	107050.00	Ready to Move	DB Realty presents a luxurious development in the heart of Nepean Sea Road. Available in 2 BHK, 3 BHK configurations. Concierge services and 24x7 security. Landscaped podium garden with jogging track. Designer modular kitchen with imported fittings. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Pool View",NRI,Family,Penthouse,"High Floor"}	https://maps.google.com/?q=Nepean%20Sea%20Road%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.734738	2026-01-06 16:34:05.734738	6 apartments	2 VRV enabled	165 apartments	4106 sq ft	13 ft	6th floor	IOD Approved	20:80	₹67/sq ft	1 Stacked	₹24/sq ft	Simplex	Podium Level
78	Luxuria Walkeshwar	Shapoorji Pallonji	Walkeshwar, South Mumbai	1.6 acres	4	60	Mar 2027	110000000.00	200000000.00	1256	1851	{"2 BHK","3 BHK","4 BHK"}	87798.00	108918.00	New Launch	Shapoorji Pallonji presents a luxurious development in the heart of Walkeshwar. Available in 2 BHK, 3 BHK, 4 BHK configurations. Smart home automation in all apartments. World-class amenities including infinity pool, spa, and gymnasium. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{Family,"Ultra Luxury",Duplex}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.739604	2026-01-06 16:34:05.739604	4 apartments	6 VRV enabled	181 apartments	11314 sq ft	11 ft	8th floor	Commencement Certificate	10:90	₹79/sq ft	3 Stacked	₹15/sq ft	Simplex	Foundation
79	The Crown Walkeshwar	Lodha Group	Walkeshwar, South Mumbai	3.0 acres	2	40	Mar 2027	80000000.00	290000000.00	1111	3044	{"2 BHK","3 BHK","4 BHK","5 BHK"}	71108.00	95860.00	Pre-Launch	Lodha Group presents a luxurious development in the heart of Walkeshwar. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Stunning sea views from upper floors. Premium Italian marble flooring throughout. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Sea View","High Floor"}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.744631	2026-01-06 16:34:05.744631	4 apartments	5 VRV enabled	318 apartments	13541 sq ft	11 ft	12th floor	OC Received	Construction Linked	₹96/sq ft	1 Stacked	₹23/sq ft	Triplex	Mid-rise
80	Royal Residency Pedder Road	Godrej Properties	Pedder Road, South Mumbai	1.9 acres	4	55	Ready Possession	100000000.00	240000000.00	1254	2692	{"3 BHK","4 BHK","5 BHK"}	75777.00	88630.00	Under Construction	Godrej Properties presents a luxurious development in the heart of Pedder Road. Available in 3 BHK, 4 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Concierge services and 24x7 security. Designer modular kitchen with imported fittings. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Ultra Luxury",Duplex}	https://maps.google.com/?q=Pedder%20Road%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.749981	2026-01-06 16:34:05.749981	5 apartments	3 High-speed	224 apartments	4489 sq ft	11 ft	7th floor	OC Received	Construction Linked	₹104/sq ft	2 Stacked	₹40/sq ft	Simplex	Nearing Completion
81	Sky Gardens Cuffe Parade	Sheth Creators	Cuffe Parade, South Mumbai	2.4 acres	1	36	Dec 2025	80000000.00	190000000.00	1336	1951	{"2 BHK","3 BHK","4 BHK","5 BHK"}	58253.00	99847.00	Pre-Launch	Sheth Creators presents a luxurious development in the heart of Cuffe Parade. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Private theater and business center. Dedicated parking with EV charging points. Perfect for discerning buyers seeking premium living in South Mumbai.	{Heritage,Expat,Penthouse,Celebrity,"Sea View"}	https://maps.google.com/?q=Cuffe%20Parade%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.75488	2026-01-06 16:34:05.75488	5 apartments	4 VRV enabled	153 apartments	12484 sq ft	11 ft	8th floor	OC Received	30:70	₹113/sq ft	2 Basement	₹25/sq ft	Simplex	Foundation
82	The Signature Walkeshwar	DB Realty	Walkeshwar, South Mumbai	1.9 acres	3	51	Jun 2026	120000000.00	250000000.00	1651	2472	{"2 BHK","3 BHK"}	72089.00	102294.00	Under Construction	DB Realty presents a luxurious development in the heart of Walkeshwar. Available in 2 BHK, 3 BHK configurations. Private lift lobby for each apartment. Designer modular kitchen with imported fittings. World-class amenities including infinity pool, spa, and gymnasium. Perfect for discerning buyers seeking premium living in South Mumbai.	{Duplex,"Sea View"}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.759803	2026-01-06 16:34:05.759803	5 apartments	3 High-speed	108 apartments	3260 sq ft	11 ft	11th floor	RERA Registered	Construction Linked	₹135/sq ft	3 Mechanical	₹48/sq ft	Triplex	Foundation
83	Luxuria Colaba	DB Realty	Colaba, South Mumbai	5.2 acres	3	59	Mar 2026	120000000.00	360000000.00	1821	3614	{"2 BHK","3 BHK","5 BHK"}	65582.00	99460.00	Ready to Move	DB Realty presents a luxurious development in the heart of Colaba. Available in 2 BHK, 3 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Stunning sea views from upper floors. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{HNWI,Investment,Celebrity,Family,"City View"}	https://maps.google.com/?q=Colaba%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.764786	2026-01-06 16:34:05.764786	2 apartments	3 High-speed	225 apartments	11144 sq ft	14 ft	7th floor	IOD Approved	10:90	₹57/sq ft	3 Mechanical	₹47/sq ft	Penthouse	Nearing Completion
84	Sea Face Nariman Point	Lodha Group	Nariman Point, South Mumbai	1.3 acres	4	45	Dec 2026	70000000.00	180000000.00	1308	2196	{"2 BHK","5 BHK"}	52237.00	84059.00	New Launch	Lodha Group presents a luxurious development in the heart of Nariman Point. Available in 2 BHK, 5 BHK configurations. Designer modular kitchen with imported fittings. Premium Italian marble flooring throughout. Landscaped podium garden with jogging track. Perfect for discerning buyers seeking premium living in South Mumbai.	{Premium,"High Floor",NRI,Family}	https://maps.google.com/?q=Nariman%20Point%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.770032	2026-01-06 16:34:05.770032	5 apartments	2 VRV enabled	176 apartments	6586 sq ft	10 ft	5th floor	RERA Registered	Flexi Payment	₹174/sq ft	3 Basement	₹25/sq ft	Penthouse	Ready
85	The Residences Colaba	Shapoorji Pallonji	Colaba, South Mumbai	4.1 acres	2	67	Jun 2026	90000000.00	160000000.00	1016	1620	{"2 BHK","3 BHK","4 BHK","5 BHK"}	86339.00	100274.00	Pre-Launch	Shapoorji Pallonji presents a luxurious development in the heart of Colaba. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Dedicated parking with EV charging points. World-class amenities including infinity pool, spa, and gymnasium. Stunning sea views from upper floors. Perfect for discerning buyers seeking premium living in South Mumbai.	{Heritage,Investment,Celebrity,HNWI}	https://maps.google.com/?q=Colaba%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.774575	2026-01-06 16:34:05.774575	2 apartments	5 VRV enabled	222 apartments	14323 sq ft	12 ft	7th floor	Commencement Certificate	Flexi Payment	₹104/sq ft	1 Podium	₹15/sq ft	Simplex	Ready
86	Royal Residency Colaba	Oberoi Realty	Colaba, South Mumbai	2.5 acres	2	23	Mar 2025	160000000.00	400000000.00	1910	3401	{"2 BHK","3 BHK","4 BHK"}	81774.00	118528.00	Pre-Launch	Oberoi Realty presents a luxurious development in the heart of Colaba. Available in 2 BHK, 3 BHK, 4 BHK configurations. Dedicated parking with EV charging points. Premium Italian marble flooring throughout. Stunning sea views from upper floors. Perfect for discerning buyers seeking premium living in South Mumbai.	{Duplex,Boutique,Celebrity,Penthouse,Garden}	https://maps.google.com/?q=Colaba%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.779295	2026-01-06 16:34:05.779295	3 apartments	6 High-speed	289 apartments	5014 sq ft	13 ft	3th floor	IOD Approved	Flexi Payment	₹176/sq ft	1 Mechanical	₹32/sq ft	Penthouse	Foundation
87	The Signature Pedder Road	Wadhwa Group	Pedder Road, South Mumbai	1.6 acres	1	56	Dec 2025	80000000.00	180000000.00	1154	1734	{"3 BHK","4 BHK","5 BHK"}	71783.00	102298.00	Under Construction	Wadhwa Group presents a luxurious development in the heart of Pedder Road. Available in 3 BHK, 4 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Private theater and business center. Designer modular kitchen with imported fittings. Perfect for discerning buyers seeking premium living in South Mumbai.	{Boutique,"High Floor"}	https://maps.google.com/?q=Pedder%20Road%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.784775	2026-01-06 16:34:05.784775	3 apartments	2 High-speed	57 apartments	6699 sq ft	10 ft	7th floor	RERA Registered	Construction Linked	₹163/sq ft	3 Stacked	₹49/sq ft	Simplex	Mid-rise
88	Enclave Walkeshwar	Rustomjee	Walkeshwar, South Mumbai	2.2 acres	1	56	Dec 2027	110000000.00	190000000.00	1459	2076	{"2 BHK","3 BHK","4 BHK"}	75200.00	93108.00	Ready to Move	Rustomjee presents a luxurious development in the heart of Walkeshwar. Available in 2 BHK, 3 BHK, 4 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Stunning sea views from upper floors. Premium Italian marble flooring throughout. Perfect for discerning buyers seeking premium living in South Mumbai.	{HNWI,Luxury,"Sea View",NRI,Heritage}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.789983	2026-01-06 16:34:05.789983	4 apartments	6 Service + Passenger	100 apartments	10074 sq ft	13 ft	11th floor	RERA Registered	10:90	₹141/sq ft	3 Mechanical	₹35/sq ft	Simplex	Nearing Completion
89	Palazzo Walkeshwar	Lodha Group	Walkeshwar, South Mumbai	1.5 acres	4	53	Ready Possession	110000000.00	390000000.00	1273	3146	{"4 BHK","5 BHK"}	85227.00	125100.00	New Launch	Lodha Group presents a luxurious development in the heart of Walkeshwar. Available in 4 BHK, 5 BHK configurations. Stunning sea views from upper floors. Smart home automation in all apartments. Concierge services and 24x7 security. Perfect for discerning buyers seeking premium living in South Mumbai.	{Premium,"High Floor","Sea View",Celebrity,Family}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.794524	2026-01-06 16:34:05.794524	3 apartments	5 High-speed	133 apartments	9609 sq ft	10 ft	5th floor	RERA Registered	Flexi Payment	₹169/sq ft	3 Basement	₹23/sq ft	Simplex	Foundation
90	Tower Walkeshwar	L&T Realty	Walkeshwar, South Mumbai	4.3 acres	1	42	Dec 2026	140000000.00	350000000.00	1611	2858	{"2 BHK","3 BHK","4 BHK","5 BHK"}	85020.00	120817.00	Pre-Launch	L&T Realty presents a luxurious development in the heart of Walkeshwar. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Premium Italian marble flooring throughout. Private lift lobby for each apartment. Concierge services and 24x7 security. Perfect for discerning buyers seeking premium living in South Mumbai.	{Family,"Sea View",HNWI,Duplex,"Ultra Luxury"}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.799574	2026-01-06 16:34:05.799574	2 apartments	6 VRV enabled	207 apartments	5332 sq ft	13 ft	6th floor	IOD Approved	Flexi Payment	₹159/sq ft	1 Podium	₹48/sq ft	Duplex	Nearing Completion
91	Palazzo Mahalaxmi	Godrej Properties	Mahalaxmi, South Mumbai	1.7 acres	4	52	Dec 2024	140000000.00	340000000.00	1865	3276	{"2 BHK","3 BHK","4 BHK","5 BHK"}	74198.00	102597.00	Ready to Move	Godrej Properties presents a luxurious development in the heart of Mahalaxmi. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Landscaped podium garden with jogging track. Dedicated parking with EV charging points. World-class amenities including infinity pool, spa, and gymnasium. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Ultra Luxury","Sea View"}	https://maps.google.com/?q=Mahalaxmi%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.804949	2026-01-06 16:34:05.804949	5 apartments	5 High-speed	292 apartments	3590 sq ft	13 ft	9th floor	OC Received	Construction Linked	₹110/sq ft	1 Stacked	₹36/sq ft	Triplex	Foundation
92	Enclave Malabar Hill	Marathon Group	Malabar Hill, South Mumbai	5.5 acres	4	30	Jun 2025	70000000.00	240000000.00	883	1956	{"2 BHK","3 BHK","4 BHK","5 BHK"}	83937.00	124914.00	Pre-Launch	Marathon Group presents a luxurious development in the heart of Malabar Hill. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Stunning sea views from upper floors. Concierge services and 24x7 security. Perfect for discerning buyers seeking premium living in South Mumbai.	{Family,"Sea View","Ultra Luxury","City View",Premium}	https://maps.google.com/?q=Malabar%20Hill%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.810112	2026-01-06 16:34:05.810112	5 apartments	3 High-speed	117 apartments	6974 sq ft	12 ft	6th floor	OC Received	10:90	₹62/sq ft	3 Stacked	₹48/sq ft	Simplex	Ready
93	The Peninsula Colaba	Wadhwa Group	Colaba, South Mumbai	5.3 acres	4	29	Dec 2024	110000000.00	270000000.00	1443	2131	{"3 BHK","4 BHK","5 BHK"}	76843.00	128094.00	New Launch	Wadhwa Group presents a luxurious development in the heart of Colaba. Available in 3 BHK, 4 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Stunning sea views from upper floors. Concierge services and 24x7 security. Perfect for discerning buyers seeking premium living in South Mumbai.	{NRI,Heritage,Investment,"Ultra Luxury",Luxury}	https://maps.google.com/?q=Colaba%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.814828	2026-01-06 16:34:05.814828	4 apartments	2 High-speed	294 apartments	13222 sq ft	12 ft	8th floor	RERA Registered	30:70	₹197/sq ft	1 Stacked	₹42/sq ft	Penthouse	Foundation
94	Royal Residency Nariman Point	Rustomjee	Nariman Point, South Mumbai	3.4 acres	4	32	Dec 2027	70000000.00	190000000.00	1303	1855	{"2 BHK","3 BHK","5 BHK"}	54297.00	100816.00	Pre-Launch	Rustomjee presents a luxurious development in the heart of Nariman Point. Available in 2 BHK, 3 BHK, 5 BHK configurations. World-class amenities including infinity pool, spa, and gymnasium. Concierge services and 24x7 security. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{HNWI,Celebrity}	https://maps.google.com/?q=Nariman%20Point%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.819758	2026-01-06 16:34:05.819758	3 apartments	6 High-speed	305 apartments	14508 sq ft	10 ft	3th floor	IOD Approved	10:90	₹182/sq ft	3 Basement	₹31/sq ft	Duplex	Ready
95	Primero Worli	Hiranandani Group	Worli, South Mumbai	5.1 acres	1	41	Ready Possession	70000000.00	180000000.00	872	1827	{"2 BHK","3 BHK","4 BHK","5 BHK"}	80000.00	98524.00	New Launch	Hiranandani Group presents a luxurious development in the heart of Worli. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Concierge services and 24x7 security. Dedicated parking with EV charging points. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{Penthouse,"Ultra Luxury"}	https://maps.google.com/?q=Worli%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.824605	2026-01-06 16:34:05.824605	5 apartments	3 High-speed	131 apartments	11198 sq ft	13 ft	10th floor	Commencement Certificate	Construction Linked	₹187/sq ft	1 Basement	₹44/sq ft	Simplex	Ready
96	The Signature Marine Drive	Lodha Group	Marine Drive, South Mumbai	5.5 acres	2	34	Dec 2024	130000000.00	300000000.00	1705	2878	{"2 BHK","3 BHK","4 BHK","5 BHK"}	75870.00	103568.00	Ready to Move	Lodha Group presents a luxurious development in the heart of Marine Drive. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Smart home automation in all apartments. Concierge services and 24x7 security. Private theater and business center. Perfect for discerning buyers seeking premium living in South Mumbai.	{NRI,"Pool View"}	https://maps.google.com/?q=Marine%20Drive%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.829663	2026-01-06 16:34:05.829663	3 apartments	6 VRV enabled	245 apartments	6994 sq ft	13 ft	3th floor	RERA Registered	Flexi Payment	₹144/sq ft	1 Mechanical	₹16/sq ft	Triplex	Mid-rise
97	One Cumballa Hill	SD Corp	Cumballa Hill, South Mumbai	5.6 acres	1	70	Mar 2026	80000000.00	210000000.00	1291	2706	{"2 BHK","3 BHK","4 BHK","5 BHK"}	63592.00	76307.00	Pre-Launch	SD Corp presents a luxurious development in the heart of Cumballa Hill. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Smart home automation in all apartments. Premium Italian marble flooring throughout. Concierge services and 24x7 security. Perfect for discerning buyers seeking premium living in South Mumbai.	{Penthouse,Luxury}	https://maps.google.com/?q=Cumballa%20Hill%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.834654	2026-01-06 16:34:05.834654	6 apartments	2 Service + Passenger	382 apartments	4951 sq ft	14 ft	11th floor	RERA Registered	30:70	₹128/sq ft	1 Mechanical	₹30/sq ft	Penthouse	Foundation
98	Infiniti Walkeshwar	Indiabulls Real Estate	Walkeshwar, South Mumbai	3.3 acres	4	35	Mar 2026	70000000.00	180000000.00	825	1538	{"2 BHK","3 BHK","4 BHK","5 BHK"}	80816.00	118028.00	Ready to Move	Indiabulls Real Estate presents a luxurious development in the heart of Walkeshwar. Available in 2 BHK, 3 BHK, 4 BHK, 5 BHK configurations. Smart home automation in all apartments. Designer modular kitchen with imported fittings. Premium Italian marble flooring throughout. Perfect for discerning buyers seeking premium living in South Mumbai.	{Family,Heritage,Duplex,HNWI,Luxury}	https://maps.google.com/?q=Walkeshwar%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.83961	2026-01-06 16:34:05.83961	4 apartments	2 Panoramic	97 apartments	9976 sq ft	10 ft	6th floor	IOD Approved	20:80	₹162/sq ft	1 Mechanical	₹23/sq ft	Penthouse	Ready
99	The World Towers Altamount Road	SD Corp	Altamount Road, South Mumbai	1.1 acres	4	51	Dec 2026	70000000.00	140000000.00	1155	1850	{"4 BHK","5 BHK"}	61386.00	73759.00	Ready to Move	SD Corp presents a luxurious development in the heart of Altamount Road. Available in 4 BHK, 5 BHK configurations. Landscaped podium garden with jogging track. Smart home automation in all apartments. Dedicated parking with EV charging points. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Ultra Luxury",NRI}	https://maps.google.com/?q=Altamount%20Road%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.844648	2026-01-08 10:23:02.922111	4 apartments	6 VRV enabled	260 apartments	6108 sq ft	13 ft	8th floor	IOD Approved	10:90	₹147/sq ft	3 Mechanical	₹32/sq ft	Simplex	Mid-rise
100	The Signature Cuffe Parade	Wadhwa Group	Cuffe Parade, South Mumbai	2.9 acres	2	70	Dec 2026	130000000.00	400000000.00	1968	3321	{"2 BHK","5 BHK"}	65749.00	119996.00	Ready to Move	Wadhwa Group presents a luxurious development in the heart of Cuffe Parade. Available in 2 BHK, 5 BHK configurations. Concierge services and 24x7 security. Stunning sea views from upper floors. Private lift lobby for each apartment. Perfect for discerning buyers seeking premium living in South Mumbai.	{"Ultra Luxury",Expat,HNWI,Heritage}	https://maps.google.com/?q=Cuffe%20Parade%2C%20Mumbai	t	{}	1	2026-01-06 16:34:05.849817	2026-01-08 10:23:55.714274	4 apartments	4 Panoramic	58 apartments	11977 sq ft	14 ft	8th floor	IOD Approved	30:70	₹136/sq ft	3 Basement	₹49/sq ft	Penthouse	Podium Level
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, name, role, two_factor_enabled, two_factor_secret, is_visible, visible_attributes, created_at, updated_at) FROM stdin;
1	random@gmail.com	$2a$10$qtbRTX3uoTe.trZjMpRkKeUQw1cQRskDM2966LesAFsLFHce1vtDO	Admin	admin	t	NY5FW5SMJA3WG3LJOBFWY7JDPBJHQ422O5IVO6CQGJDHOS3FJJTA	t	{"1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": true, "8": true, "9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}	2026-01-06 15:41:29.287197	2026-01-06 15:41:29.287197
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 2, true);


--
-- Name: otp_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.otp_codes_id_seq', 1, false);


--
-- Name: project_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_media_id_seq', 7, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 120, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: otp_codes otp_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_pkey PRIMARY KEY (id);


--
-- Name: project_media project_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_media
    ADD CONSTRAINT project_media_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: otp_codes otp_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_media project_media_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_media
    ADD CONSTRAINT project_media_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_media project_media_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_media
    ADD CONSTRAINT project_media_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict TuqW9t4nZUrC33DLYlIflsiRu5vZ4WrPbhw9fSbzVrq3FpAJbk9YMz2L5lkinUB

