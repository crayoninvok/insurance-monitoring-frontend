export type Role = 'ADMIN' | 'USER';
export type Gender = 'MALE' | 'FEMALE';
export type Status = 'ACTIVE' | 'INACTIVE';

export type Department =
  | 'HRGA'
  | 'FINANCE'
  | 'PROCUREMENT'
  | 'OPERATIONS'
  | 'PLANT'
  | 'INFRASTRUCTURE'
  | 'LOGISTICS'
  | 'TRAINING_CENTER'
  | 'MANAGEMENT';

export type Branch = 'HEAD_OFFICE' | 'SENYIUR' | 'MUARA_PAHU';

export type Position =
  | 'DIRECTOR'
  | 'MANAGER'
  | 'SUPERINTENDENT'
  | 'SUPERVISOR'
  | 'JUNIOR_SUPERVISOR'
  | 'WORKER';

export type ApiSuccess<T> = { success: true } & T;
export type ApiFailure = {
  success: false;
  message: string;
  error?: string;
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = ApiResponse<{
  token: string;
}>;

export type CreateUserRequest = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  gender: Gender;
  department: Department;
  branch: Branch;
  position: Position;
  status?: Status;
  // Catatan: backend akan memaksa role=USER untuk endpoint ini
  role?: Role;
};

export type CreateUserResponse = ApiResponse<{
  data: {
    id: string;
    email: string;
    role: Role;
    createdAt: string;
  };
}>;

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: Gender;
  department: Department;
  branch: Branch;
  position: Position;
  status: Status;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

export type GetMeResponse = ApiResponse<{
  data: UserProfile;
}>;

export type UpdateMyProfileRequest = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: Gender;
  password?: string;
};

export type UpdateMyProfileResponse = ApiResponse<{
  data: UserProfile;
}>;

export type AdminListUsersResponse = ApiResponse<{
  data: UserProfile[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}>;

export type AdminUpdateUserRequest = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  gender?: Gender;
  department?: Department;
  branch?: Branch;
  position?: Position;
  status?: Status;
  role?: Role;
  password?: string;
};

export type AdminUpdateUserResponse = ApiResponse<{
  data: UserProfile;
}>;

export type BudgetPolicy = {
  id: string;
  year: number;
  position: Position;
  // backend mengirim decimal sebagai string
  annualAmount: string;
};

export type BenefitType = 'RAWAT_JALAN' | 'RAWAT_INAP' | 'MELAHIRKAN';

export type RawatInapServiceType = 'TARIF_KAMAR_DAYS' | 'TANPA_OPERASI' | 'OPERASI';

export type RawatJalanPolicy = {
  id: string;
  year: number;
  position: Position;
  annualAmount: string;
};

export type MelahirkanPolicy = {
  id: string;
  year: number;
  position: Position;
  annualAmount: string;
};

export type RawatInapPolicy = {
  id: string;
  year: number;
  position: Position;
  serviceType: RawatInapServiceType;
  capAmount: string;
};

export type UpsertBudgetPolicyRequest = {
  year?: number;
  position: Position;
  annualAmount: number | string;
};

export type UpsertBudgetPolicyResponse = ApiResponse<{
  data: BudgetPolicy;
}>;

export type ListBudgetPoliciesResponse = ApiResponse<{
  data: BudgetPolicy[];
}>;

export type BudgetSummary = {
  allocated: string;
  spent: string;
  remaining: string;
};

export type MyBudget = {
  year: number;
  rawatJalan: BudgetSummary;
  rawatInap: BudgetSummary;
  melahirkan: BudgetSummary | null;
};

export type GetMyBudgetResponse = ApiResponse<{
  data: MyBudget;
}>;

export type AdminUserBudgetRow = {
  userId: string;
  firstName: string;
  lastName: string;
  department: Department;
  branch: Branch;
  position: Position;
  gender: Gender;
  year: number;
  rawatJalan: BudgetSummary;
  rawatInap: BudgetSummary;
  melahirkan: BudgetSummary | null;
};

export type ListAdminUserBudgetsResponse = ApiResponse<{
  data: AdminUserBudgetRow[];
}>;

/** Rawat Inap: kamar (tarif/hari × hari) + nominal operasi atau tanpa operasi (bucket terpisah di backend). */
export type RawatInapSpendDetail = {
  roomRatePerDay: number | string;
  days: number | string;
  isOperasi: boolean;
  procedureAmount: number | string;
};

export type AdminSpendForUserRequest = {
  userId: string;
  year?: number;
  /** Wajib kecuali benefit RAWAT_INAP dengan rawatInapDetail. */
  amount?: number | string;
  note?: string;
  documentUrl?: string;
  documentPublicId?: string;
  documentOriginalName?: string;
  // legacy support (single pool)
  spendCategory?: SpendCategory;
  // new system
  benefitType?: BenefitType;
  rawatJalanMedicalId?: string;
  rawatInapEpisodeId?: string;
  /** Episode option untuk RI; backend akan cari/buat episode user otomatis. */
  rawatInapEpisodeOptionId?: string;
  rawatInapServiceType?: RawatInapServiceType;
  rawatInapDetail?: RawatInapSpendDetail;
};

export type AdminSpendForUserResponse = ApiResponse<{
  data: {
    userId: string;
    year: number;
    allocated: string;
    spent: string;
    remaining: string;
  };
}>;

export type AdminResetUserTransactionsRequest = {
  userId: string;
  year?: number;
};

export type AdminResetUserTransactionsResponse = ApiResponse<{
  data: {
    userId: string;
    year: number;
    deletedLedgerCount: number;
  };
}>;

export type AdminOptionTrendItem = {
  optionId: string;
  optionName: string;
  count: number;
  totalAmount: string;
};

export type ListAdminOptionTrendsResponse = ApiResponse<{
  data: {
    year: number;
    rawatJalan: AdminOptionTrendItem[];
    rawatInap: AdminOptionTrendItem[];
  };
}>;

export type SpendCategory =
  | 'RAWAT_INAP'
  | 'MCU'
  | 'RAWAT_JALAN'
  | 'BELI_OBAT'
  | 'DOKTER_UMUM'
  | 'OPERASI';

export type BudgetTxnType = 'ALLOCATE' | 'SPEND' | 'ADJUST';

export type AdminUserLedgerEntry = {
  id: string;
  year: number;
  type: BudgetTxnType;
  amount: string;
  spendCategory?: SpendCategory | null;
  benefitType?: BenefitType | null;
  rawatInapServiceType?: RawatInapServiceType | null;
  rawatJalanMedical?: { id: string; name: string } | null;
  rawatInapEpisode?: { id: string; sickConditionLabel: string } | null;
  documentUrl?: string | null;
  documentPublicId?: string | null;
  documentOriginalName?: string | null;
  note?: string | null;
  createdAt: string;
};

export type UploadSpendDocumentResponse = ApiResponse<{
  data: {
    url: string;
    publicId: string;
    originalName: string;
  };
}>;

export type ListAdminUserLedgerResponse = ApiResponse<{
  data: AdminUserLedgerEntry[];
}>;

export type UpsertRawatJalanPolicyRequest = {
  year?: number;
  position: Position;
  annualAmount: number | string;
};

export type UpsertRawatJalanPolicyResponse = ApiResponse<{
  data: RawatJalanPolicy;
}>;

export type ListRawatJalanPoliciesResponse = ApiResponse<{
  data: RawatJalanPolicy[];
}>;

export type UpsertMelahirkanPolicyRequest = {
  year?: number;
  position: Position;
  annualAmount: number | string;
};

export type UpsertMelahirkanPolicyResponse = ApiResponse<{
  data: MelahirkanPolicy;
}>;

export type ListMelahirkanPoliciesResponse = ApiResponse<{
  data: MelahirkanPolicy[];
}>;

export type UpsertRawatInapPolicyRequest = {
  year?: number;
  position: Position;
  serviceType: RawatInapServiceType;
  capAmount: number | string;
};

export type UpsertRawatInapPolicyResponse = ApiResponse<{
  data: RawatInapPolicy;
}>;

export type ListRawatInapPoliciesResponse = ApiResponse<{
  data: RawatInapPolicy[];
}>;

export type RawatJalanMedical = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListRawatJalanMedicalsResponse = ApiResponse<{
  data: RawatJalanMedical[];
}>;

export type CreateRawatJalanMedicalRequest = { name: string };
export type CreateRawatJalanMedicalResponse = ApiResponse<{ data: RawatJalanMedical }>;
export type SetRawatJalanMedicalActiveRequest = { isActive: boolean };
export type SetRawatJalanMedicalActiveResponse = ApiResponse<{ data: RawatJalanMedical }>;

export type RawatInapEpisodeOption = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListRawatInapEpisodeOptionsResponse = ApiResponse<{
  data: RawatInapEpisodeOption[];
}>;

export type CreateRawatInapEpisodeOptionRequest = { name: string };
export type CreateRawatInapEpisodeOptionResponse = ApiResponse<{ data: RawatInapEpisodeOption }>;
export type SetRawatInapEpisodeOptionActiveRequest = { isActive: boolean };
export type SetRawatInapEpisodeOptionActiveResponse = ApiResponse<{ data: RawatInapEpisodeOption }>;

export type RawatInapEpisode = {
  id: string;
  userId: string;
  year: number;
  rawatInapEpisodeOptionId: string;
  /** Label dari opsi episode (nama tampilan) */
  sickConditionLabel: string;
  createdAt: string;
};

export type ListRawatInapEpisodesResponse = ApiResponse<{
  data: RawatInapEpisode[];
}>;

export type CreateRawatInapEpisodeRequest = {
  userId: string;
  year?: number;
  rawatInapEpisodeOptionId: string;
};

export type CreateRawatInapEpisodeResponse = ApiResponse<{
  data: {
    episode: RawatInapEpisode;
    balances: Array<{
      id: string;
      serviceType: RawatInapServiceType;
      allocated: string;
      spent: string;
    }>;
  };
}>;

